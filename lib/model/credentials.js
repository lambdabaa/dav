'use strict';

/**
 * Options:
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (String) clientId - oauth client id.
 *   (String) clientSecret - oauth client secret.
 *   (String) authorizationCode - oauth code.
 *   (String) redirectUrl - oauth redirect url.
 *   (String) tokenUrl - oauth token url.
 *   (String) accessToken - oauth access token.
 *   (String) refreshToken - oauth refresh token.
 *   (Number) expiration - unix time for access token expiration.
 */
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
