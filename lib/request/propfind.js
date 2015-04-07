'use strict';

var parser = require('../parser'),
    template = require('../template'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 */
module.exports = function(options) {
  function transformResponse(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    var responses = multistatus.response.map(function(response) {
      return {
        href: response.href,
        props: util.getProps(response.propstat)  // propstats => props
      };
    });

    if (!options.mergeResponses) {
      return responses;
    }

    // Merge the props.
    var merged = util.mergeProps(
      responses.map(function(response) {
        return response.props;
      })
    );

    var hrefs = responses.map(function(response) {
      return response.href;
    });

    return { props: merged, hrefs: hrefs };
  }

  return {
    method: 'PROPFIND',
    data: template.propfind(options),
    transformResponse: transformResponse,
    depth: options.depth
  };
};
