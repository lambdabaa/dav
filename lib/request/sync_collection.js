'use strict';

var Request = require('./request'),
    dav = require('./dav'),
    parser = require('../parser'),
    template = require('../template');

/**
 * Options:
 *
 *   (String) depth - option value for Depth header.
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
    var responses = multistatus.response.map(function(response) {
      return { href: response.href, props: dav.getProps(response.propstat) };
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
