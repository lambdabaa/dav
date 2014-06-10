'use strict';

var _ = require('underscore'),
    debug = require('debug')('davinci:calendars'),
    model = require('./model'),
    request = require('./request'),
    url = require('url');

/**
 * @param {davinci.Calendar} calendar the calendar to put the object on.
 * @return {Promise} promise will resolve when the calendar has been created.
 *
 * Options:
 *   (String) filename - name for the calendar ics file.
 *   (String) data - rfc 5545 VCALENDAR object.
 *   (Object) sandbox - optional request sandbox.
 */
exports.createCalendarObject = function(calendar, options) {
  var objectUrl = url.resolve(calendar.url, options.filename);
  return request.put({
    url: objectUrl,
    username: calendar.account.username,
    password: calendar.account.password,
    data: options.data,
    sandbox: options.sandbox
  })
  .send();
};

/**
 * @param {davinci.CalendarObject} calendarObject updated calendar object.
 * @return {Promise} promise will resolve when the calendar has been updated.
 *
 * Options:
 *   (Object) sandbox - optional request sandbox.
 */
exports.updateCalendarObject = function(calendarObject, options) {
  return request.put({
    url: calendarObject.url,
    username: calendarObject.calendar.account.username,
    password: calendarObject.calendar.account.password,
    data: calendarObject.data,
    sandbox: options && options.sandbox,
    etag: calendarObject.etag
  })
  .send();
};

/**
 * @param {davinci.CalendarObject} calendarObject target calendar object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *   (Object) sandbox - optional request sandbox.
 */
exports.deleteCalendarObject = function(calendarObject, options) {
  return request.delete({
    url: calendarObject.url,
    username: calendarObject.calendar.account.username,
    password: calendarObject.calendar.account.password,
    sandbox: options && options.sandbox,
    etag: calendarObject.etag
  })
  .send();
};

/**
 * @param {davinci.Calendar} calendar the calendar to fetch objects for.
 */
function fetchObjects(calendar, options) {
  debug('Doing REPORT on calendar ' + calendar.url +
        ' which belongs to ' + calendar.account.username);
  return request.calendarQuery({
    url: calendar.url,
    username: calendar.account.username,
    password: calendar.account.password,
    sandbox: options && options.sandbox,
    depth: 1,
    props: [
      { name: 'getetag', namespace: 'd' },
      { name: 'calendar-data', namespace: 'c' }
    ],
    filters: [
      { type: 'comp', name: 'VCALENDAR', namespace: 'c' }
    ]
  })
  .send()
  .then(function(responses) {
    return responses.map(function(response) {
      debug('Found calendar object with url ' + response.href);
      return new model.CalendarObject({
        calendar: calendar,
        url: url.resolve(calendar.account.caldavUrl, response.href),
        etag: response.props.getetag,
        data: response.props['calendar-data']
      });
    });
  });
}
exports.fetchObjects = fetchObjects;

/**
 * @param {davinci.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *   (Object) sandbox - optional request sandbox.
 */
exports.sync = function(calendar, options) {
  return new Promise(function(resolve, reject) {
    if (!calendar.ctag) {
      debug('Missing ctag.');
      return resolve(false);
    }

    debug('Fetch remote getctag prop.');
    return request.propfind({
      url: calendar.account.homeUrl,
      username: calendar.account.username,
      password: calendar.account.password,
      sandbox: options && options.sandbox,
      props: [ { name: 'getctag', namespace: 'cs' } ],
      depth: 1
    })
    .send()
    .then(function(responses) {
      debug('Found ' + responses.length + ' calendars. ' +
            'Will search for calendar from ' + calendar.url);
      var response = _.find(responses, function(response) {
        return calendar.url.indexOf(response.href) !== -1;
      });

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
    return fetchObjects(calendar, options).then(function(objects) {
      calendar.objects = objects;
      return calendar;
    });
  });
};
