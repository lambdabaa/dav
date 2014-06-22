'use strict';

var Model = require('./model'),
    util = require('util');

function CalendarObject() {
  Model.apply(this, arguments);
}
util.inherits(CalendarObject, Model);
module.exports = CalendarObject;

/**
 * @type {Object}
 */
CalendarObject.prototype.data = null;

/**
 * @type {dav.Calendar}
 */
CalendarObject.prototype.calendar = null;

/**
 * @type {String}
 */
CalendarObject.prototype.etag = null;

/**
 * @type {String}
 */
CalendarObject.prototype.calendarData = null;

/**
 * @type {String}
 */
CalendarObject.prototype.url = null;
