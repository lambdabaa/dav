var accounts = require('./accounts'),
    calendars = require('./calendars'),
    model = require('./model'),
    request = require('./request'),
    sandbox = require('./sandbox');

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
 * request
 */
exports.request = request;

/**
 * sandbox
 */
exports.createSandbox = sandbox;
