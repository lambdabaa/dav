'use strict';

function Credentials(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Credentials;

Credentials.prototype = {
  /**
   * @type {String}
   */
  username: null,

  /**
   * @type {String}
   */
  password: null
};
