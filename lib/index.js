var accounts = require('./accounts'),
    calendars = require('./calendars'),
    model = require('./model'),
    sandbox = require('./sandbox'),
    client = require('./client');

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
