'use strict';

var debug = require('debug')('dav:calendars'),
    model = require('./model'),
    ns = require('./namespace'),
    request = require('./request'),
    url = require('url');

/**
 * @param {dav.Calendar} calendar the calendar to put the object on.
 * @return {Promise} promise will resolve when the calendar has been created.
 *
 * Options:
 *
 *   (String) data - rfc 5545 VCALENDAR object.
 *   (String) filename - name for the calendar ics file.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.createCalendarObject = function(calendar, options) {
  var objectUrl = url.resolve(calendar.url, options.filename);
  var req = request.basic({
    method: 'PUT',
    data: options.data
  });

  return options.xhr.send(req, objectUrl, { sandbox: options.sandbox });
};

/**
 * @param {dav.CalendarObject} calendarObject updated calendar object.
 * @return {Promise} promise will resolve when the calendar has been updated.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.updateCalendarObject = function(calendarObject, options) {
  var req = request.basic({
    method: 'PUT',
    data: calendarObject.calendarData,
    etag: calendarObject.etag
  });

  return options.xhr.send(req, calendarObject.url, {
    sandbox: options.sandbox
  });
};

/**
 * @param {dav.CalendarObject} calendarObject target calendar object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.deleteCalendarObject = function(calendarObject, options) {
  var req = request.basic({
    method: 'DELETE',
    etag: calendarObject.etag
  });

  return options.xhr.send(req, calendarObject.url, {
    sandbox: options.sandbox
  });
};

/**
 * @param {dav.Calendar} calendar the calendar to fetch objects for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
function fetchObjects(calendar, options) {
  debug('Doing REPORT on calendar ' + calendar.url +
        ' which belongs to ' + calendar.account.credentials.username);

  var filters = options.filters || [{
    type: 'comp-filter',
    attrs: { name: 'VCALENDAR' },
    children: [{
      type: 'comp-filter',
      attrs: { name: 'VEVENT' }
    }]
  }];

  var req = request.calendarQuery({
    depth: 1,
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'calendar-data', namespace: ns.CALDAV }
    ],
    filters: filters
  });

  return options.xhr.send(req, calendar.url, { sandbox: options.sandbox })
  .then(function(responses) {
    return responses.map(function(response) {
      debug('Found calendar object with url ' + response.href);
      return new model.CalendarObject({
        data: response,
        calendar: calendar,
        url: url.resolve(calendar.account.rootUrl, response.href),
        etag: response.props.getetag,
        calendarData: response.props.calendarData
      });
    });
  });
}
exports.fetchObjects = fetchObjects;

function basicSync(calendar, options) {
  return new Promise(function(resolve, reject) {
    if (!calendar.ctag) {
      debug('Missing ctag.');
      return resolve(false);
    }

    debug('Fetch remote getctag prop.');
    var req = request.propfind({
      url: calendar.account.homeUrl,
      props: [ { name: 'getctag', namespace: ns.CALENDAR_SERVER } ],
      depth: 0
    });

    return options.xhr.send(req, calendar.account.homeUrl, {
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
    return fetchObjects(calendar, options)
    .then(function(objects) {
      calendar.objects = objects;
      return calendar;
    });
  });
}

function webdavSync(calendar, options) {
  var req = request.syncCollection({
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'calendar-data', namespace: ns.CALDAV }
    ],
    syncLevel: 1,
    syncToken: calendar.syncToken
  });

  return options.xhr.send(req, calendar.url, {
    sandbox: options.sandbox
  })
  .then(function(result) {
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
 * @param {dav.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *
 *   (Array.<Object>) filters - list of caldav filters to send with request.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
 *       try to do webdav sync and failover to basic sync if rfc 6578 is not
 *       supported by the server.
 *   (String) timezone - VTIMEZONE calendar object.
 *   (dav.Transport) xhr - request sender.
 */
exports.sync = function(calendar, options) {
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
    return webdavSync(calendar, options);
  } else {
    debug('basic sync.');
    return basicSync(calendar, options);
  }
};
