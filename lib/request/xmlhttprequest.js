/**
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
var Native = typeof(window) !== 'undefined' ?
  window.XMLHttpRequest :
  require('xmlhttprequest').XMLHttpRequest;

var debug = require('debug')('davinci:request:xmlhttprequest');

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

XMLHttpRequest.prototype.send = function(data) {
  debug('Sending request data: ' + data);
  this.sandbox && this.sandbox.add(this);

  var native = this.native;
  native.send(data);
  return new Promise(function(resolve, reject) {
    native.onreadystatechange = function() {
      if (native.readyState !== 4 /* done */) {
        return;
      }

      if (native.status >= 400) {
        debug('Bad status: ' + native.status);
        return reject(new Error(native.statusText));
      }

      debug('Received xhr response: ' + native.responseText);
      return resolve(native.responseText);
    };

    native.ontimeout = function() {
      reject(new Error('Request timed out after ' + native.timeout + 'ms'));
    };
  });
};
