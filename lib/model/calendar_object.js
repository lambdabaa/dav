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
   * @type {String}
   */
  etag: null,

  /**
   * @type {String}
   */
  data: null,

  /**
   * @type {String}
   */
  url: null
};
