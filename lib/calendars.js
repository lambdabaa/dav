'use strict';

var debug = require('debug')('davinci:calendars'),
    model = require('./model'),
    namespace = require('./namespace'),
    request = require('./request'),
    transport = require('./transport'),
    url = require('url');

/**
 * @param {davinci.Calendar} calendar the calendar to put the object on.
 * @return {Promise} promise will resolve when the calendar has been created.
 *
 * Options:
 *
 *   (String) data - rfc 5545 VCALENDAR object.
 *   (String) filename - name for the calendar ics file.
 *   (Object) sandbox - optional request sandbox.
 *   (davinci.Transport) xhr - optional request sender.
 */
exports.createCalendarObject = function(calendar, options) {
  if (!options) {
    options = {};
  }

  var xhr = options.xhr || new transport.Basic(calendar.account.credentials);
  var objectUrl = url.resolve(calendar.url, options.filename);
  var req = request.put({
    url: objectUrl,
    data: options.data
  });

  return xhr.send(req, { sandbox: options.sandbox });
};

/**
 * @param {davinci.CalendarObject} calendarObject updated calendar object.
 * @return {Promise} promise will resolve when the calendar has been updated.
 *
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 *   (davinci.Transport) xhr - optional request sender.
 */
exports.updateCalendarObject = function(calendarObject, options) {
  if (!options) {
    options = {};
  }

  var xhr = options.xhr ||
            new transport.Basic(calendarObject.calendar.account.credentials);
  var req = request.put({
    url: calendarObject.url,
    data: calendarObject.calendarData,
    etag: calendarObject.etag
  });

  return xhr.send(req, { sandbox: options.sandbox });
};

/**
 * @param {davinci.CalendarObject} calendarObject target calendar object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 *   (davinci.Transport) xhr - optional request sender.
 */
exports.deleteCalendarObject = function(calendarObject, options) {
  if (!options) {
    options = {};
  }

  var xhr = options.xhr ||
            new transport.Basic(calendarObject.calendar.account.credentials);

  var req = request.delete({
    url: calendarObject.url,
    etag: calendarObject.etag
  });

  return xhr.send(req, { sandbox: options.sandbox });
};

/**
 * @param {davinci.Calendar} calendar the calendar to fetch objects for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (Object) sandbox - optional request sandbox.
 */
function fetchObjects(xhr, calendar, options) {
  debug('Doing REPORT on calendar ' + calendar.url +
        ' which belongs to ' + calendar.account.credentials.username);

  if (!options) {
    options = {};
  }

  var filters = options.filters || [{
    type: 'comp-filter',
    attrs: { name: 'VCALENDAR' },
    children: [{
      type: 'comp-filter',
      attrs: { name: 'VEVENT' }
    }]
  }];

  var req = request.calendarQuery({
    url: calendar.url,
    depth: 1,
    props: [
      { name: 'getetag', namespace: namespace.DAV },
      { name: 'calendar-data', namespace: namespace.CALDAV }
    ],
    filters: filters
  });

  return xhr.send(req, { sandbox: options.sandbox }).then(function(responses) {
    return responses.map(function(response) {
      debug('Found calendar object with url ' + response.href);
      return new model.CalendarObject({
        data: response,
        calendar: calendar,
        url: url.resolve(calendar.account.caldavUrl, response.href),
        etag: response.props.getetag,
        calendarData: response.props.calendarData
      });
    });
  });
}
exports.fetchObjects = fetchObjects;

function basicSync(xhr, calendar, options) {
  return new Promise(function(resolve, reject) {
    if (!calendar.ctag) {
      debug('Missing ctag.');
      return resolve(false);
    }

    debug('Fetch remote getctag prop.');
    var req = request.propfind({
      url: calendar.account.homeUrl,
      props: [ { name: 'getctag', namespace: namespace.CALENDAR_SERVER } ],
      depth: 0
    });

    return xhr.send(req, {
      sandbox: options.sandbox
    })
    .then(function(responses) {
      debug('Found ' + responses.length + ' calendars. ' +
            'Will search for calendar from ' + calendar.url);
      var response = responses.filter(function(response) {
        // Find the response that corresponds to the parameter calendar.
        return calendar.url.indexOf(response.href) !== -1;
      })[0];

      if (!response) {
        reject(new Error('Could not find remote calendar. ' +
                         'Perhaps it was deleted?'));
      }

      debug('Check whether the ctag we have cached matches the one ' +
            'we just fetched from the remote server.');
      return resolve(calendar.ctag !== response.props.getctag);
    });
  })
  .then(function(sync) {
    if (!sync) {
      debug('Local ctag matched remote! No need to sync :).');
      return calendar;
    }

    debug('ctag changed so we need to fetch stuffs.');
    return fetchObjects(xhr, calendar, options).then(function(objects) {
      calendar.objects = objects;
      return calendar;
    });
  });
}

function webdavSync(xhr, calendar, options) {
  var req = request.syncCollection({
    url: calendar.url,
    props: [
      { name: 'getetag', namespace: namespace.DAV },
      { name: 'calendar-data', namespace: namespace.CALDAV }
    ],
    syncLevel: 1,
    syncToken: calendar.syncToken
  });

  return xhr.send(req, { sandbox: options.sandbox }).then(function(result) {
    // TODO(gareth): Handle creations and deletions.
    result.responses.forEach(function(response) {
      // Find the calendar object that this response corresponds with.
      var calendarObject = calendar.objects.filter(function(object) {
        return object.url.indexOf(response.href) !== -1;
      })[0];

      if (!calendarObject) {
        return;
      }

      calendarObject.etag = response.props.getetag;
      calendarObject.calendarData = response.props.calendarData;
    });

    calendar.syncToken = result.syncToken;
    return calendar;
  });
}

/**
 * @param {davinci.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *
 *   (Array.<Object>) filters - list of caldav filters to send with request.
 *   (Object) sandbox - optional request sandbox.
 *   (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
 *       try to do webdav sync and failover to basic sync if rfc 6578 is not
 *       supported by the server.
 *   (String) timezone - VTIMEZONE calendar object.
 *   (davinci.Transport) xhr - optional request sender.
 */
exports.sync = function(calendar, options) {
  if (!options) {
    options = {};
  }

  var xhr = options.xhr || new transport.Basic(calendar.account.credentials);

  var syncMethod;
  if ('syncMethod' in options) {
    syncMethod = options.syncMethod;
  } else {
    syncMethod = (calendar.reports &&
                  calendar.reports.indexOf('syncCollection') !== -1) ?
      'webdav' :
      'basic';
  }

  if (syncMethod === 'webdav') {
    debug('rfc 6578 sync.');
    return webdavSync(xhr, calendar, options);
  } else {
    debug('basic sync.');
    return basicSync(xhr, calendar, options);
  }
};
