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
  password: null,

  /**
   * @type {String}
   */
  clientId: null,

  /**
   * @type {String}
   */
  clientSecret: null,

  /**
   * @type {String}
   */
  authorizationCode: null,

  /**
   * @type {String}
   */
  redirectUrl: null,

  /**
   * @type {String}
   */
  tokenUrl: null,

  /**
   * @type {String}
   */
  accessToken: null,

  /**
   * @type {String}
   */
  refreshToken: null,

  /**
   * @type {Number}
   */
  expiration: null
};
