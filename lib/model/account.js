'use strict';

var Model = require('./model'),
    util = require('util');

function Account() {
  Model.apply(this, arguments);
}
util.inherits(Account, Model);
module.exports = Account;

/**
 * @type {String}
 */
Account.prototype.server = null;

/**
 * @type {dav.Credentials}
 */
Account.prototype.credentials = null;

/**
 * @type {String}
 */
Account.prototype.rootUrl = null;

/**
 * @type {String}
 */
Account.prototype.principalUrl = null;

/**
 * @type {String}
 */
Account.prototype.homeUrl = null;

/**
 * @type {Array.<dav.Calendar>}
 */
Account.prototype.calendars = null;

/**
 * @type {Array.<dav.AddressBook>}
 */
Account.prototype.addressBooks = null;
