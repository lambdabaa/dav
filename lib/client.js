/**
 * @fileoverview The core of the DAV client.
 *
 * var client = new davinci.Client({
 *      baseUrl : 'http://dav.example.org/',
 *      userName : 'foo',
 *      password : 'bar'
 * });
 *
 * Performing a request:
 *
 * client.request('OPTIONS')
 *    .then(function(response) { 
 *        console.log(response.getStatus())
 *    });
 *
 */
'use strict';

var
    urlLib = require('url'),
    XMLHttpRequest = require('./request/xmlhttprequest'),
    Response = require('./response/response'),
    Request = require('./request/request');

/*jshint -W079 */
if (typeof(Promise) === 'undefined') {
  var Promise = require('es6-promise').Promise;
}
/*jshint +W079 */

function Client(options) {

  if (!options || !options.baseUrl) {
    throw new Error('A baseUrl must be passed to this constructor');
  }
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }

};

module.exports = Client;

Client.prototype = {

  /**
   * @type {String}
   */
  userName: null,

  /**
   * @type {String}
   */
  password: null,

  /**
   * @type {String}
   */
  baseUrl: null,

  errorHandlers : [], 
  
  /**
   * Helper method to easily construct a HTTP request.
   */
  request : function(method, url, headers, body) {

      var request = new Request({
        method  : method,
        url     : url,
        headers : headers,
        body    : body
      });
      return this.send(request);

  },

  send : function(request) {

    var xhr = new XMLHttpRequest();
    xhr.open(
        request.getMethod(),
        this.getAbsoluteUrl(request.getUrl()),
        true,
        this.userName ? this.userName : '',
        this.password ? this.password : ''
    );

    var promise = xhr.send(request.getBody());
    var newPromise = new Promise(function(resolve, reject) {

        // Wrapping this promise, because we want the 'resolved' promise to have
        // access to all the response information.
        promise.then(function() {
            return resolve(new Response(xhr));
        }, function(err) {
            return reject(err);
        });

    });
    return newPromise;

  },

  getAbsoluteUrl : function(url) {

    if (url === undefined) url = '';
    return urlLib.resolve(this.baseUrl, url);

  }

}
