'use strict';
/**
 * @fileoverview See rfc 6764.
 */
var XMLHttpRequest = require('./xmlhttprequest'),
    debug = require('debug')('davinci:request:discovery'),
    format = require('util').format,
    url = require('url');

/**
 * Options:
 *   (String) bootstrap - one of 'caldav' or 'carddav'. Defaults to 'caldav'.
 *   (String) server - url for calendar server.
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
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

  var contextPath;
  var discovery = new XMLHttpRequest();
  discovery.open('GET', uri, true, options.username, options.password);
  return discovery
    .send()
    .then(function() {
      if (discovery.status >= 300 && discovery.status <= 400) {
        contextPath = discovery.getResponseHeader('Location');
        debug('Discovery redirected to ' + contextPath);
      }
    })
    .catch(function(error) {
      // That didn't go so well now did it?
      debug('Discovery failed with error ' + error);
    })
    .then(function() {
      if (contextPath && contextPath.length) {
        endpoint = url.parse(
          url.resolve(
            endpoint.protocol + '//' + endpoint.host,
            contextPath
          )
        );
      } else {
        debug('Fall back to using provided server url.');
      }

      return Promise.resolve(endpoint.href);
    });
};
