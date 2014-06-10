'use strict';

function Account(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Account;

Account.prototype = {
  /**
   * @type {String}
   */
  server: null,

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
  caldavUrl: null,

  /**
   * @type {String}
   */
  principalUrl: null,

  /**
   * @type {String}
   */
  homeUrl: null,

  /**
   * @type {Array.<davinci.Calendar>}
   */
  calendars: null
};
