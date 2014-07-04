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
   * @param {dav.Request} req - dav request.
   * @param {String} uri - where to send request.
   * @return {Promise} a promise that will be resolved with an xhr request
   *     after its readyState is 4 or the result of applying an optional
   *     request `transformResponse` function to the xhr object after its
   *     readyState is 4.
   *
   * Options:
   *
   *   (Object) sandbox - optional request sandbox.
   */
  send: function(req, uri, options) {
    if (this.baseUrl) {
      var urlObj = url.parse(uri);
      uri = url.resolve(this.baseUrl, urlObj.path);
    }

    return this.xhr.send(req, uri, options);
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

  syncCaldavAccount: function(account, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return calendars.syncAccount(account, options);
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

  syncCarddavAccount: function(account, options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return contacts.syncAccount(account, options);
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
