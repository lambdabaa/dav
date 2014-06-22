'use strict';

var accounts = require('./accounts'),
    calendars = require('./calendars'),
    contacts = require('./contacts');

/**
 * @param {dav.Transport} xhr - request sender.
 */
function Client(xhr) {
  this.xhr = xhr;
}
module.exports = Client;

Client.prototype = {
  /* Expose internal modules for unit testing */
  get _accounts() {
    return accounts;
  },

  get _calendars() {
    return calendars;
  },

  get _contacts() {
    return contacts;
  },

  createAccount: function(options) {
    options.xhr = options.xhr || this.xhr;
    return accounts.create(options);
  },

  createCalendarObject: function(calendar, options) {
    options.xhr = options.xhr || this.xhr;
    return calendars.createCalendarObject(calendar, options);
  },

  updateCalendarObject: function(calendarObject, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return calendars.updateCalendarObject(calendarObject, options);
  },

  deleteCalendarObject: function(calendarObject, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return calendars.deleteCalendarObject(calendarObject, options);
  },

  syncCalendar: function(calendar, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return calendars.sync(calendar, options);
  },

  createCard: function(addressBook, options) {
    options.xhr = options.xhr || this.xhr;
    return contacts.createCard(addressBook, options);
  },

  updateCard: function(card, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return contacts.updateCard(card, options);
  },

  deleteCard: function(card, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return contacts.deleteCard(card, options);
  },

  syncAddressBook: function(addressBook, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return contacts.sync(addressBook, options);
  }
};
