var Propfind = require('./request/propfind'),
    Xhr = require('./request/xhr'),
    debug = require('debug')('accounts'),
    format = require('util').format,
    propfind = require('./request/propfind'),
    url = require('url');

/**
 * Options:
 *   (String) username
 *   (String) password
 *   (String) server
 */
exports.create = function(options) {
  debug('Attempt service discovery.');
  var endpoint = url.parse(options.server);
  var protocol = endpoint.protocol || 'http:';
  var uri = format('%s//%s/.well-known/caldav', protocol, endpoint.host);
  var wellknown = new Xhr({
    method: 'GET',
    url: uri,
    username: options.username,
    password: options.password,
    sandbox: options.sandbox
  });

  var location;
  return wellknown
    .send()
    .then(function(response) {
      location = response.getResponseHeader('Location');
    })
    .catch(function(error) {
      // That didn't go so well now did it?
    })
    .then(function() {
      if (location && location.length) {
        endpoint = url.parse(location);
      } else {
        debug('Fall back to using given server url.');
      }

      var currentPrincipal = propfind({
        url: endpoint.href,
        username: options.username,
        password: options.password,
        sandbox: options.sandbox,
        // See http://tools.ietf.org/html/rfc5397.
        props: ['current-user-principal']
      });

      currentPrincipal.headers = { Depth: 0 };
      return currentPrincipal.send();
    })
    .then(function(response) {
      // use url for calendar-home-set query.
    })
    .then(function(response) {
      // use urls to do reports for each calendar.
    })
    .then(function(response) {
      // Use ical.js
    });
};

exports.remove = function(account, options) {
};
