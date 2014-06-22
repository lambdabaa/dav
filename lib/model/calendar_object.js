'use strict';

var DAVObject = require('./dav_object'),
    util = require('util');

function CalendarObject() {
  DAVObject.apply(this, arguments);
}
util.inherits(CalendarObject, DAVObject);
module.exports = CalendarObject;

/**
 * @type {dav.Calendar}
 */
CalendarObject.prototype.calendar = null;

/**
 * @type {String}
 */
CalendarObject.prototype.calendarData = null;
