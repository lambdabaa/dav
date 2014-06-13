'use strict';

var accounts = require('./accounts'),
    calendars = require('./calendars');

/**
 * Options:
 *
 *   (String) password - plaintext password for calendar user.
 *   (String) server - some url for server (needn't be base url).
 *   (String) username - username (perhaps email) for calendar user.
 */
function Client(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Client;

Client.prototype = {
  /**
   * @type {String}
   */
  username: null,

  /**
   * @type {String}
   */
  password: null,

  /**
   * @type {String}
   */
  server: null,

  createAccount: function(options) {
    if (!options) {
      options = {};
    }

    [
      'username',
      'password',
      'server'
    ].forEach(function(key) {
      // Default to the client value.
      options[key] = options[key] || this[key];
    }, this);

    return accounts.create(options);
  },

  createCalendarObject: function(calendar, options) {
    if (!options) {
      options = {};
    }

    [
      'username',
      'password'
    ].forEach(function(key) {
      // Default to the client value.
      options[key] = options[key] || this[key];
    }, this);

    return calendars.createCalendarObject(calendar, options);
  },

  updateCalendarObject: function(calendarObject, options) {
    if (!options) {
      options = {};
    }

    [
      'username',
      'password'
    ].forEach(function(key) {
      // Default to the client value.
      options[key] = options[key] || this[key];
    }, this);

    return calendars.updateCalendarObject(calendarObject, options);
  },

  deleteCalendarObject: function(calendarObject, options) {
    if (!options) {
      options = {};
    }

    [
      'username',
      'password'
    ].forEach(function(key) {
      // Default to the client value.
      options[key] = options[key] || this[key];
    }, this);

    return calendars.deleteCalendarObject(calendarObject, options);
  },

  syncCalendar: function(calendar, options) {
    if (!options) {
      options = {};
    }

    [
      'username',
      'password'
    ].forEach(function(key) {
      // Default to the client value.
      options[key] = options[key] || this[key];
    }, this);

    return calendars.sync(calendar, options);
  }
};
