/* global window */
/**
 * @fileoverview Promise wrapper around native xhr api.
 *
 * Usage:
 *
 *   var xhr = new XMLHttpRequest();
 *   xhr.sandbox = ...;
 *   xhr.open(...);
 *   xhr
 *     .send(...)
 *     .then(function(responseText) {
 *     })
 *     .catch(function(error) {
 *     });
 */
'use strict';

var Native = typeof(window) !== 'undefined' ?
  window.XMLHttpRequest :
  require('xmlhttprequest').XMLHttpRequest;

var debug = require('debug')('dav:transport:xmlhttprequest');

function XMLHttpRequest(options) {
  this.native = new Native(options);
  this.sandbox = null;

  /* readwrite */
  [
    'response',
    'responseText',
    'responseType',
    'responseXML',
    'timeout',
    'upload',
    'withCredentials'
  ].forEach(function(attribute) {
    Object.defineProperty(this, attribute, {
      get: function() { return this.native[attribute]; },
      set: function(value) { this.native[attribute] = value; }
    });
  }, this);

  /* readonly */
  [
    'status',
    'statusText'
  ].forEach(function(attribute) {
    Object.defineProperty(this, attribute, {
      get: function() { return this.native[attribute]; }
    });
  }, this);
}
module.exports = XMLHttpRequest;

/* jshint -W040 */
[
  'abort',
  'getAllResponseHeaders',
  'getResponseHeader',
  'open',
  'overrideMimeType',
  'setRequestHeader'
].forEach(function(method) {
  XMLHttpRequest.prototype[method] = function() {
    return this.native[method].apply(this.native, arguments);
  };
}, this);
/* jshint +W040 */

XMLHttpRequest.prototype.send = function(data) {
  debug('Sending request data: ' + data);
  if (this.sandbox) {
    this.sandbox.add(this);
  }

  var native = this.native;
  native.send(data);
  return new Promise(function(resolve, reject) {
    native.onreadystatechange = function() {
      if (native.readyState !== 4 /* done */) {
        return;
      }

      debug('Received xhr response: ' + native.responseText);

      if (native.status >= 400) {
        return reject(new Error('Bad status: ' + native.status));
      }

      return resolve(native.responseText);
    };

    native.ontimeout = function() {
      reject(new Error('Request timed out after ' + native.timeout + 'ms'));
    };
  });
};
