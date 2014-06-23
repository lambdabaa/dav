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
module.exports = function(options) {
  var endpoint = url.parse(options.server),
      protocol = endpoint.protocol || 'http:',
      bootstrap = options.bootstrap || 'caldav';

  var uri = format(
    '%s//%s/.well-known/%s',
    protocol,
    endpoint.host,
    bootstrap
  );

  function transformResponse(xhr) {
    if (xhr.status >= 200 && xhr.status <= 400) {
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
  }

  function onerror(error) {
    // That didn't go so well now did it?
    debug('Discovery failed with error ' + error);
    return endpoint.href;
  }

  return new Request({
    method: 'GET',
    url: uri,
    transformResponse: transformResponse,
    onerror: onerror
  });
};
