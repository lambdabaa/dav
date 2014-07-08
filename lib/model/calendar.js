/**
 * @class Calendar
 * @memberof model
 * @property {Array.<String>} components - calendar component types (eg VTODO).
 * @property {String} timezone - calendar's timezone.
 */
'use strict';

var DAVCollection = require('./dav_collection'),
    util = require('util');

/**
 * @constructor
 */
function Calendar() {
  DAVCollection.apply(this, arguments);
}
util.inherits(Calendar, DAVCollection);
module.exports = Calendar;

Calendar.prototype.components = null;

Calendar.prototype.timezone = null;
