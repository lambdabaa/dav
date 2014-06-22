'use strict';

var Model = require('./model'),
    util = require('util');

function Calendar() {
  Model.apply(this, arguments);
}
util.inherits(Calendar, Model);
module.exports = Calendar;

/**
 * @type {Object}
 */
Calendar.prototype.data = null;

/**
 * @type {dav.Account}
 */
Calendar.prototype.account = null;

/**
 * @type {String}
 */
Calendar.prototype.ctag = null;

/**
 * @type {String}
 */
Calendar.prototype.displayName = null;

/**
 * @type {Array.<dav.CalendarObject>}
 */
Calendar.prototype.objects = null;

/**
 * @type {Array.<String>}
 */
Calendar.prototype.components = null;

/**
 * @type {Array.<String>}
 */
Calendar.prototype.reports = null;

/**
 * @type {String}
 */
Calendar.prototype.url = null;

/**
 * @type {String}
 */
Calendar.prototype.description = null;

/**
 * @type {String}
 */
Calendar.prototype.timezone = null;

/**
 * @type {String}
 */
Calendar.prototype.syncToken = null;
