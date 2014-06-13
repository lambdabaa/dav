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
    responseLib = require('./response'),
    requestLib = require('./request'),
    api = require('./api');

function Client(options) {

  if (!options || !options.baseUrl) {
    throw new Error('A baseUrl must be passed to this constructor');
  }
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }

  this.caldav = new api.CalDAV(this);

}

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

  caldav : null,

  /**
   * Helper method to easily construct a HTTP request.
   */
  request : function(method, url, headers, body) {

      var request = new requestLib.Request({
        method  : method,
        url     : url,
        headers : headers,
        body    : body
      });
      return this.send(request);

  },

  /**
   * Sends a request object to a server.
   *
   * This method returns a promise.
   */
  send : function(request, ResponseClass) {

    var xhr = new XMLHttpRequest();
    xhr.open(
        request.getMethod(),
        this.getAbsoluteUrl(request.getUrl()),
        true,
        this.userName ? this.userName : '',
        this.password ? this.password : ''
    );

    var headers = request.getHeaders();
    for (var headerName in headers) {
        xhr.setRequestHeader(headerName, headers[headerName]);
    }
    var promise = xhr.send(request.getBody());
    var newPromise = new Promise(function(resolve, reject) {

        // Wrapping this promise, because we want the 'resolved' promise to have
        // access to all the response information.
        promise.then(function() {

            if (xhr.status < 200 || xhr.status > 399) {
                return reject(new Error('Received HTTP error: ' + xhr.status));
            } else {
                if (typeof(ResponseClass)==='undefined') {
                    return resolve(new responseLib.Response(xhr));
                } else {
                    return resolve(new ResponseClass(xhr));
                }
            }

        }, function(err) {
            return reject(err);
        });

    });
    return newPromise;

  },

  propFind : function(url, properties, depth) {

      var request = new requestLib.PropFind(
        url,
        properties,
        depth
      );

      return this.send(request, responseLib.MultiStatus);

  },

  getAbsoluteUrl : function(url) {

    if (url === undefined) {
      url = '';
    }
    return urlLib.resolve(this.baseUrl, url);

  }

};
