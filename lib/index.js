/**
 * Promise polyfill
 */
if (typeof(Promise) === 'undefined') {
  /*jshint -W079 */
  var Promise = require('es6-promise').Promise;
  /*jshint +W079 */
  /*global window */
  console.log('hi');
  if (typeof(window) !== 'undefined') {
    window.Promise = Promise;
  } else {
    global.Promise = Promise;
  }
}

var accounts = require('./accounts'),
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
 * sandbox
 */
exports.createSandbox = sandbox;

/**
 * client
 */
exports.Client = client;

