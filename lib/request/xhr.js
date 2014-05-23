/**
 * @fileoverview Tiny wrapper around XMLHttpRequest that
 *     exposes a promises api and handles authorization.
 */
var debug = require('debug')('xhr');

var Native = typeof(window) !== 'undefined' ?
  window.XMLHttpRequest :
  require('xmlhttprequest').XMLHttpRequest;

/**
 * Options:
 *   (String) method - http method.
 *   (String) url - url for request.
 *   (String) username - dav user.
 *   (String) password - dav password.
 *   (Sandbox) sandbox - xhr request sandbox.
 */
function Xhr(options) {
  this.headers = {};

  if (options) {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Xhr;

Xhr.prototype = {
  body: null,
  headers: null,

  send: function() {
    debug(this.method + ' ' + this.url);
    var xhr = new Native();
    if (this.sandbox) {
      this.sandbox.add(this);
    }

    xhr.open(
      this.method,
      this.url,
      true /* async */,
      this.username,
      this.password
    );

    for (var key in this.headers) {
      xhr.setRequestHeader(key, this.headers[key]);
    }
    xhr.setRequestHeader('Content-Type', 'text/html; charset=UTF-8');
    this.xhr = xhr;

    xhr.send(this.body);
    return new Promise(function(resolve, reject) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) {
          return;
        }

        if (xhr.status < 200 || xhr.status > 400) {
          reject(new Error(xhr.status));
        }

        return resolve(xhr);
      };
    });
  },

  abort: function() {
    return this.xhr && this.xhr.abort();
  }
};
