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
   * @type {davinci.Account}
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
   * @type {Array.<davinci.CalendarObject>}
   */
  objects: null,

  /**
   * @type {Array.<String>}
   */
  components: null,

  /**
   * @type {String}
   */
  url: null
};
