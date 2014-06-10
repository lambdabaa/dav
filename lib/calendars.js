'use strict';

var put = require('./request').put,
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
  return put({
    url: objectUrl,
    username: calendar.username,
    password: calendar.password,
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
  return put({
    url: calendarObject.url,
    username: calendarObject.calendar.username,
    password: calendarObject.calendar.password,
    data: calendarObject.data,
    sandbox: options && options.sandbox,
    etag: calendarObject.etag
  })
  .send();
};
