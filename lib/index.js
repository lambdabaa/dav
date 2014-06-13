var accounts = require('./accounts'),
    calendars = require('./calendars'),
    model = require('./model'),
    sandbox = require('./sandbox');

/**
 * Promise polyfill
 */
if (typeof(Promise) === 'undefined') {
  /*jshint -W079 */
  var Promise = require('es6-promise').Promise;
  /*jshint +W079 */
  /*global window */
  if (typeof(window) !== 'undefined') {
    window.Promise = Promise;
  } else {
    global.Promise = Promise;
  }
}

/**
 * model
 */
exports.Account = model.Account;
exports.Calendar = model.Calendar;
exports.CalendarObject = model.CalendarObject;

/**
 * accounts
 */
exports.createAccount = accounts.create;

/**
 * calendars
 */
exports.createCalendarObject = calendars.createCalendarObject;
exports.updateCalendarObject = calendars.updateCalendarObject;
exports.deleteCalendarObject = calendars.deleteCalendarObject;
exports.syncCalendar = calendars.sync;

/**
 * sandbox
 */
exports.createSandbox = sandbox;
