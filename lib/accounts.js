var XMLHttpRequest = require('./request/xmlhttprequest'),
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

  var location;
  var discovery = new XMLHttpRequest();
  discovery.open('GET', uri, true, options.username, options.password);
  return discovery
    .send()
    .then(function() {
      if (discovery.status === 301) {
        location = discovery.getResponseHeader('Location');
      }
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

      return propfind({
        url: endpoint.href,
        username: options.username,
        password: options.password,
        props: ['current-user-principal'],
        depth: 0
      });
    })
    .then(function(responseText) {
      console.log(responseText);
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
