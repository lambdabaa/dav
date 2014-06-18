'use strict';

function CalendarObject(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = CalendarObject;

CalendarObject.prototype = {
  /**
   * @type {Object}
   */
  data: null,

  /**
   * @type {davinci.Calendar}
   */
  calendar: null,

  /**
   * @type {String}
   */
  etag: null,

  /**
   * @type {String}
   */
  calendarData: null,

  /**
   * @type {String}
   */
  url: null
};
