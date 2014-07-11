'use strict';

var Client = require('./client'),
    Sandbox = require('./sandbox'),
    accounts = require('./accounts'),
    calendars = require('./calendars'),
    contacts = require('./contacts'),
    debug = require('debug'),
    jsonify = require('./jsonify'),
    model = require('./model'),
    ns = require('./namespace'),
    request = require('./request'),
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
exports.syncCaldavAccount = calendars.syncAccount;

/**
 * contacts
 */
exports.createCard = contacts.createCard;
exports.updateCard = contacts.updateCard;
exports.deleteCard = contacts.deleteCard;
exports.syncAddressBook = contacts.sync;
exports.syncCarddavAccount = contacts.syncAccount;

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
exports.createSandbox = function() {
  return new Sandbox();
};
exports.Sandbox = Sandbox;

/**
 * transport
 */
exports.transport = transport;
exports.Transport = transport.Transport;

/**
 * etc
 */
exports.debug = debug;
exports.jsonify = jsonify;
exports.ns = ns;
