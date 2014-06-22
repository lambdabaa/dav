var Client = require('./client'),
    accounts = require('./accounts'),
    calendars = require('./calendars'),
    contacts = require('./contacts'),
    model = require('./model'),
    request = require('./request'),
    sandbox = require('./sandbox'),
    transport = require('./transport');

/**
 * model
 */
exports.Account = model.Account;
exports.AddressBook = model.AddressBook;
exports.Calendar = model.Calendar;
exports.CalendarObject = model.CalendarObject;
exports.Credentials = model.Credentials;
exports.VCard = model.VCard;

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
 * contacts
 */
exports.createCard = contacts.createCard;
exports.updateCard = contacts.updateCard;
exports.deleteCard = contacts.deleteCard;
exports.syncAddressBook = contacts.sync;

/**
 * client
 */
exports.Client = Client;

/**
 * request
 */
exports.request = request;

/**
 * sandbox
 */
exports.createSandbox = sandbox;

/**
 * transport
 */
exports.transport = transport;
