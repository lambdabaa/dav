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
   * @type {String}
   */
  username: null,

  /**
   * @type {String}
   */
  password: null,

  /**
   * @type {String}
   */
  ctag: null,

  /**
   * @type {String}
   */
  displayname: null,

  /**
   * @type {Array.<CalendarObject>}
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
