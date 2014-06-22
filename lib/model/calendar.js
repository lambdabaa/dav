'use strict';

var DAVCollection = require('./dav_collection'),
    util = require('util');

function Calendar() {
  DAVCollection.apply(this, arguments);
}
util.inherits(Calendar, DAVCollection);
module.exports = Calendar;

/**
 * @type {Array.<String>}
 */
Calendar.prototype.components = null;

/**
 * @type {String}
 */
Calendar.prototype.timezone = null;
