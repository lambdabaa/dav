/**
 * @fileoverview See rfc 6764.
 */
'use strict';

var Request = require('./request'),
    debug = require('debug')('dav:request:discovery'),
    format = require('util').format,
    url = require('url');

/**
 * Options:
 *
 *   (String) bootstrap - one of 'caldav' or 'carddav'. Defaults to 'caldav'.
 *   (String) server - url for calendar server.
 */
function Discovery(options) {
  this.transformResponse = this.transformResponse.bind(this);
  this.onerror = this.onerror.bind(this);

  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }

  this.endpoint = url.parse(this.server);
}
module.exports = Discovery;

Discovery.prototype = {
  /**
   * @type {String}
   */
  bootstrap: null,

  /**
   * @type {String}
   */
  endpoint: null,

  /**
   * @type {String}
   */
  server: null,

  transformResponse: function(xhr) {
    var endpoint = this.endpoint;
    if (xhr.status >= 300 && xhr.status <= 400) {
      var location = xhr.getResponseHeader('Location');
      if (typeof location === 'string' && location.length) {
        debug('Discovery redirected to ' + location);
        endpoint = url.parse(
          url.resolve(
            endpoint.protocol + '//' + endpoint.host,
            location
          )
        );
      }
    }

    return endpoint.href;
  },

  onerror: function(error) {
    // That didn't go so well now did it?
    debug('Discovery failed with error ' + error);
    return endpoint.href;
  },

  /**
   * @return {dav.request.Request} request object.
   */
  createRequest: function() {
    var endpoint = this.endpoint,
        protocol = endpoint.protocol || 'http:',
        bootstrap = this.bootstrap || 'caldav';

    this.uri = format(
      '%s//%s/.well-known/%s',
      protocol,
      endpoint.host,
      bootstrap
    );

    return new Request({
      method: 'GET',
      url: uri,
      transformResponse: this.transformResponse,
      onerror: this.onerror
    });
  }
};
