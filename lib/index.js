/**
 * @module dav
 */
'use strict';

var Client = require('./client'),
    accounts = require('./accounts'),
    calendars = require('./calendars'),
    contacts = require('./contacts'),
    model = require('./model'),
    request = require('./request'),
    sandbox = require('./sandbox'),
    transport = require('./transport');

/** {@link model.Account} */
exports.Account = model.Account;

/** {@link model.AddressBook} */
exports.AddressBook = model.AddressBook;

/** {@link model.Calendar} */
exports.Calendar = model.Calendar;

/** {@link model.CalendarObject} */
exports.CalendarObject = model.CalendarObject;

/** {@link model.Credentials} */
exports.Credentials = model.Credentials;

/** {@link model.DAVCollection} */
exports.DAVCollection = model.DAVCollection;

/** {@link model.DAVObject} */
exports.DAVObject = model.DAVObject;

/** {@link model.Model} */
exports.Model = model.Model;

/** {@link model.VCard} */
exports.VCard = model.VCard;

/** {@link module:accounts.create} */
exports.createAccount = accounts.create;

/** {@link module:calendars.createCalendarObject} */
exports.createCalendarObject = calendars.createCalendarObject;

/** {@link module:calendars.updateCalendarObject} */
exports.updateCalendarObject = calendars.updateCalendarObject;

/** {@link module:calendars.deleteCalendarObject} */
exports.deleteCalendarObject = calendars.deleteCalendarObject;

/** {@link module:calendars.sync} */
exports.syncCalendar = calendars.sync;
exports.syncCaldavAccount = calendars.syncAccount;

/** {@link module:contacts.createCard} */
exports.createCard = contacts.createCard;

/** {@link module:contacts.updateCard} */
exports.updateCard = contacts.updateCard;

/** {@link module:contacts.deleteCard} */
exports.deleteCard = contacts.deleteCard;

/** {@link module:contacts.sync} */
exports.syncAddressBook = contacts.sync;
exports.syncCarddavAccount = contacts.syncAccount;

/** {@link Client} */
exports.Client = Client;

/** {@link request} */
exports.request = request;

/** {@link request.Request} */
exports.Request = request.Request;

/** {@link module:sandbox.Sandbox} */
exports.Sandbox = sandbox.Sandbox;

/** {@link module:sandbox.createSandbox} */
exports.createSandbox = sandbox.createSandbox;

/** {@link transport} */
exports.transport = transport;

/** {@link transport.Transport} */
exports.Transport = transport.Transport;
