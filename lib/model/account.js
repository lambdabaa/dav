/**
 * @class Account
 * @memberof model
 * @property {String} server - account dav server url.
 * @property {dav.Credentials} credentials - info for dav account access.
 * @property {String} rootUrl - base url for dav server.
 * @property {String} principalUrl - account's dav root url.
 * @property {String} homeUrl - user's dav home url.
 * @property {Array.<model.Calendar>} calendars - list of account's calendars.
 * @property {Array.<model.AddressBook>} addressBooks - list of account's
 *     address books.
 */
'use strict';

var Model = require('./model'),
    util = require('util');

/**
 * @constructor
 */
function Account() {
  Model.apply(this, arguments);
}
util.inherits(Account, Model);
module.exports = Account;

Account.prototype.server = null;

Account.prototype.credentials = null;

Account.prototype.rootUrl = null;

Account.prototype.principalUrl = null;

Account.prototype.homeUrl = null;

Account.prototype.calendars = null;

Account.prototype.addressBooks = null;
