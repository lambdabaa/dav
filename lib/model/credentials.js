/**
 * @class Credentials
 * @memberof model
 * @property {String} username - username (perhaps email) for calendar user.
 * @property {String} password - plaintext password for calendar user.
 * @property {String} clientId - oauth client id.
 * @property {String} clientSecret - oauth client secret.
 * @property {String} authorizationCode - oauth code.
 * @property {String} redirectUrl - oauth redirect url.
 * @property {String} tokenUrl - oauth access token.
 * @property {String} accessToken - oauth refresh token.
 * @property {String} refreshToken - oauth refresh token.
 * @property {Number} expiration - unix time for access token expiration.
 */
'use strict';

var Model = require('./model'),
    util = require('util');

/**
 * @constructor
 */
function Credentials() {
  Model.apply(this, arguments);
}
util.inherits(Credentials, Model);
module.exports = Credentials;

Credentials.prototype.username = null;

Credentials.prototype.password = null;

Credentials.prototype.clientId = null;

Credentials.prototype.clientSecret = null;

Credentials.prototype.authorizationCode = null;

Credentials.prototype.redirectUrl = null;

Credentials.prototype.tokenUrl = null;

Credentials.prototype.accessToken = null;

Credentials.prototype.refreshToken = null;

Credentials.prototype.expiration = null;
