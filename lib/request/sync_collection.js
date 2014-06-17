'use strict';

var Request = require('./request'),
    dav = require('./dav'),
    parser = require('../parser'),
    template = require('../template');

/**
 * Options:
 *
 *   (Array.<Object>) props - list of props to request.
 *   (Number) syncLevel - indicates scope of the sync report request.
 *   (String) syncToken - synchronization token provided by the server.
 *   (String) url - endpoint to request.
 */
module.exports = function(options) {
  var requestData = template.syncCollection({
    props: options.props,
    syncLevel: options.syncLevel,
    syncToken: options.syncToken
  });

  function transformRequest(xhr) {
    dav.setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    dav.verifyMultistatus(multistatus);
    var responses = multistatus.responses.map(function(response) {
      return { href: response.href, props: dav.getProps(response.propstats) };
    });

    return { responses: responses, syncToken: multistatus.syncToken };
  }

  return new Request({
    method: 'REPORT',
    url: options.url,
    requestData: requestData,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
};
