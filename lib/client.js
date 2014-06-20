'use strict';

var accounts = require('./accounts'),
    calendars = require('./calendars');

/**
 * @param {dav.Transport} xhr - request sender.
 */
function Client(xhr) {
  this.xhr = xhr;
}
module.exports = Client;

Client.prototype = {
  createAccount: function(options) {
    if (!options) {
      options = {};
    }

    options.xhr = options.xhr || this.xhr;
    return accounts.create(options);
  },

  createCalendarObject: function(calendar, options) {
    if (!options) {
      options = {};
    }

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
  }
};
