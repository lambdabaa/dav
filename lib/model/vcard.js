/**
 * @class VCard
 * @memberof model
 * @property {model.AddressBook} addressBook - collection that card belongs to.
 * @property {String} addressData - vcard data.
 */
'use strict';

var DAVObject = require('./dav_object'),
    util = require('util');

/**
 * @constructor
 */
function VCard() {
  DAVObject.apply(this, arguments);
}
util.inherits(VCard, DAVObject);
module.exports = VCard;

VCard.prototype.addressBook = null;

VCard.prototype.addressData = null;
