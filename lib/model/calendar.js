'use strict';

function Calendar(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Calendar;

Calendar.prototype = {
  /**
   * @type {Object}
   */
  data: null,

  /**
   * @type {dav.Account}
   */
  account: null,

  /**
   * @type {String}
   */
  ctag: null,

  /**
   * @type {String}
   */
  displayName: null,

  /**
   * @type {Array.<dav.CalendarObject>}
   */
  objects: null,

  /**
   * @type {Array.<String>}
   */
  components: null,

  /**
   * @type {Array.<String>}
   */
  reports: null,

  /**
   * @type {String}
   */
  url: null,

  /**
   * @type {String}
   */
  description: null,

  /**
   * @type {String}
   */
  timezone: null,

  /**
   * @type {String}
   */
  syncToken: null
};
