'use strict';

var XMLHttpRequest = require('./xmlhttprequest'),
    dav = require('./dav'),
    parser = require('../parser'),
    template = require('../template');

/**
 * Options:
 *   (String) url - endpoint to request.
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (Array.<Object>) props - list of props to request.
 *   (Array.<Object>) filters - list of filters to send with request.
 *   (String) depth - optional value for Depth header.
 *   (Object) sandbox - optional request sandbox.
 */
module.exports = function(options) {
  var request = new XMLHttpRequest();
  request.sandbox = options.sandbox;
  request.open(
    'REPORT',
    options.url,
    true /* async */,
    options.username,
    options.password
  );

  dav.setRequestHeaders(request, options);

  var body = template.calendarQuery({
    props: options.props,
    filters: options.filters
  });

  return request.send(body).then(function(responseText) {
    var multistatus = parser.multistatus(responseText);
    dav.verifyMultistatus(multistatus);
    return multistatus.map(function(response) {
      return { href: response.href, props: dav.getProps(response.propstats) };
    });
  });
};
