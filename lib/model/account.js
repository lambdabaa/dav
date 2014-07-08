'use strict';

function Account(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
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
