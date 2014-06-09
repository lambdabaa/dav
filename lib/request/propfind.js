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
 *   (String) depth - optional value for Depth header.
 *   (Object) sandbox - optional request sandbox.
 */
module.exports = function(options) {
  var request = new XMLHttpRequest();
  request.sandbox = options.sandbox;
  request.open(
    'PROPFIND',
    options.url,
    true /* async */,
    options.username,
    options.password
  );

  dav.setRequestHeaders(request, options);

  var body = template.propfind({ props: options.props });
  return request.send(body).then(function(responseText) {
    var multistatus = parser.multistatus(responseText);
    dav.verifyMultistatus(multistatus);
    var responses = multistatus.map(function(response) {
      return {
        href: response.href,
        props: dav.getProps(response.propstats)  // propstatus => props
      };
    });

    if (!options.mergeResponses) {
      return responses;
    }

    // Merge the props.
    var merged = dav.mergeProps(
      responses.map(function(response) {
        return response.props;
      })
    );

    return { props: merged, href: responses[0].href };
  });
};
