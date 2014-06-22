'use strict';

var DAVObject = require('./dav_object'),
    util = require('util');

function VCard() {
  DAVObject.apply(this, arguments);
}
util.inherits(VCard, DAVObject);
module.exports = VCard;

/**
 * @type {dav.AddressBook}
 */
VCard.prototype.addressBook = null;

/**
 * @type {String}
 */
VCard.prototype.addressData = null;
