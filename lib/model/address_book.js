/**
 * @class AddressBook
 * @memberof model
 */
'use strict';

var DAVCollection = require('./dav_collection'),
    util = require('util');

/**
 * @constructor
 */
function AddressBook() {
  DAVCollection.apply(this, arguments);
}
util.inherits(AddressBook, DAVCollection);
module.exports = AddressBook;
