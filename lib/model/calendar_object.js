/**
 * @class CalendarObject
 * @memberof model
 * @property {model.Calendar} calendar - collection to which this belongs.
 * @property {String} calendarData - ics file.
 */
'use strict';

var DAVObject = require('./dav_object'),
    util = require('util');

/**
 * @constructor
 */
function CalendarObject() {
  DAVObject.apply(this, arguments);
}
util.inherits(CalendarObject, DAVObject);
module.exports = CalendarObject;

CalendarObject.prototype.calendar = null;

CalendarObject.prototype.calendarData = null;
