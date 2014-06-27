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
for (var key in model) {
  exports[key] = model[key];
}

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
exports.Request = request.Request;

/**
 * sandbox
 */
exports.createSandbox = sandbox;

/**
 * transport
 */
exports.transport = transport;
exports.Transport = transport.Transport;
