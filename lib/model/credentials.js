'use strict';

var Model = require('./model'),
    util = require('util');

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
function Credentials() {
  Model.apply(this, arguments);
}
util.inherits(Credentials, Model);
module.exports = Credentials;

/**
 * @type {String}
 */
Credentials.prototype.username = null;

/**
 * @type {String}
 */
Credentials.prototype.password = null;

/**
 * @type {String}
 */
Credentials.prototype.clientId = null;

/**
 * @type {String}
 */
Credentials.prototype.clientSecret = null;

/**
 * @type {String}
 */
Credentials.prototype.authorizationCode = null;

/**
 * @type {String}
 */
Credentials.prototype.redirectUrl = null;

/**
 * @type {String}
 */
Credentials.prototype.tokenUrl = null;

/**
 * @type {String}
 */
Credentials.prototype.accessToken = null;

/**
 * @type {String}
 */
Credentials.prototype.refreshToken = null;

/**
 * @type {Number}
 */
Credentials.prototype.expiration = null;
