'use strict';

var Request = require('./request'),
    dav = require('./dav'),
    parser = require('../parser'),
    template = require('../template');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 *   (String) url - endpoint to request.
 */
module.exports = function(options) {
  var requestData = template.propfind({ props: options.props });

  function transformRequest(xhr) {
    dav.setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    var responses = multistatus.response.map(function(response) {
      return {
        href: response.href,
        props: dav.getProps(response.propstat)  // propstats => props
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

    var hrefs = responses.map(function(response) {
      return response.href;
    });

    return { props: merged, hrefs: hrefs };
  }

  return new Request({
    method: 'PROPFIND',
    url: options.url,
    requestData: requestData,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
};
