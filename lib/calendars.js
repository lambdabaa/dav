'use strict';

var debug = require('debug')('dav:calendars'),
    model = require('./model'),
    ns = require('./namespace'),
    request = require('./request'),
    url = require('url'),
    webdav = require('./webdav');

/**
 * @param {dav.Account} account to fetch calendars for.
 */
exports.listCalendars = function(account, options) {
  debug('Fetch calendars from home url ' + account.homeUrl);
  var req = request.propfind({
    props: [
      { name: 'calendar-description', namespace: ns.CALDAV },
      { name: 'calendar-timezone', namespace: ns.CALDAV },
      { name: 'displayname', namespace: ns.DAV },
      { name: 'getctag', namespace: ns.CALENDAR_SERVER },
      { name: 'resourcetype', namespace: ns.DAV },
      { name: 'supported-calendar-component-set', namespace: ns.CALDAV },
      { name: 'sync-token', namespace: ns.DAV }
    ],
    depth: 1
  });

  return options.xhr.send(req, account.homeUrl, { sandbox: options.sandbox })
  .then(function(responses) {
    debug('Found ' + responses.length + ' calendars.');
    return responses
      .filter(function(response) {
        // We only want the calendar object if it does events.
        var components = response.props.supportedCalendarComponentSet;
        return components && components.indexOf('VEVENT') !== -1;
      })
      .map(function(response) {
        debug('Found calendar named ' + response.props.displayname);
        debug('props: ' + JSON.stringify(response.props));
        return new model.Calendar({
          data: response,
          account: account,
          description: response.props.calendarDescription,
          timezone: response.props.calendarTimezone,
          url: url.resolve(account.rootUrl, response.href),
          ctag: response.props.getctag,
          displayName: response.props.displayname,
          components: response.props.supportedCalendarComponentSet,
          resourcetype: response.props.resourcetype,
          syncToken: response.props.syncToken
        });
      });
  })
  .then(function(cals) {
    return Promise.all(cals.map(function(cal) {
      var promises = [];

      promises.push(
        webdav.supportedReportSet(cal, options)
        .then(function(value) {
          cal.reports = value;
        })
      );

      if (options.loadObjects) {
        promises.push(
          exports.listCalendarObjects(cal, options)
          .then(function(value) {
            cal.objects = value;
          })
        );
      }

      return Promise.all(promises)
      .then(function() {
        return cal;
      });
    }));
  });
};

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
  return webdav.createObject(objectUrl, options.data, options);
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
  return webdav.updateObject(
    calendarObject.url,
    calendarObject.calendarData,
    calendarObject.etag,
    options
  );
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
  return webdav.deleteObject(
    calendarObject.url,
    calendarObject.etag,
    options
  );
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
exports.listCalendarObjects = function(calendar, options) {
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
};

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
  options.basicSync = basicSync;
  options.webdavSync = webdavSync;
  return webdav.syncCollection(calendar, options);
};

/**
 * @param {dav.Account} account the account to fetch updates for.
 * @return {Promise} promise will resolve with updated account.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.syncAccount = function(account, options) {
  if (!options) {
    options = {};
  }
  options.loadObjects = false;

  if (!account.calendars) {
    account.calendars = [];
  }

  return exports.listCalendars(account, options)
  .then(function(cals) {
    cals
      .filter(function(cal) {
        // Filter the calendars not previously seen.
        return account.calendars.every(function(prev) {
          return prev.url.indexOf(cal.url) === -1;
        });
      })
      .forEach(function(cal) {
        // Add them to the account's calendar list.
        account.calendars.push(cal);
      });

    options.loadObjects = true;
    return Promise.all(
      account.calendars.map(function(cal, index) {
        return exports.sync(cal, options)
        .catch(function(error) {
          debug('Sync calendar ' + cal.displayName + ' failed with ' + error);
          account.calendars.splice(index, 1);
        });
      })
    );
  })
  .then(function() {
    return account;
  });
};

function basicSync(calendar, options) {
  return webdav.isCollectionDirty(calendar, options)
  .then(function(sync) {
    if (!sync) {
      debug('Local ctag matched remote! No need to sync :).');
      return calendar;
    }

    debug('ctag changed so we need to fetch stuffs.');
    return exports.listCalendarObjects(calendar, options)
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

  return options.xhr.send(req, calendar.url, { sandbox: options.sandbox })
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
