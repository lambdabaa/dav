'use strict';

var accounts = require('./accounts'),
    calendars = require('./calendars'),
    contacts = require('./contacts'),
    url = require('url');

/**
 * @param {dav.Transport} xhr - request sender.
 *
 * Options:
 *
 *   (String) baseUrl - root url to resolve relative request urls with.
 */
function Client(xhr, options) {
  this.xhr = xhr;

  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Client;

Client.prototype = {
  /**
   * @param {dav.request.Request} req - dav request.
   * @return {Promise} a promise that will be resolved with an xhr request
   *     after its readyState is 4 or the result of applying an optional
   *     request `transformResponse` function to the xhr object after its
   *     readyState is 4.
   *
   * Options:
   *
   *   (Object) sandbox - optional request sandbox.
   *   (String) url - relative url for request.
   */
  send: function(req, options) {
    if (this.baseUrl && 'url' in options) {
      var urlObj = url.parse(options.url);
      req.url = url.resolve(this.baseUrl, urlObj.path);
    }

    return this.xhr.send(req, options);
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
  },

  /* Expose internal modules for unit testing */
  get _accounts() {
    return accounts;
  },

  get _calendars() {
    return calendars;
  },

  get _contacts() {
    return contacts;
  }
};
