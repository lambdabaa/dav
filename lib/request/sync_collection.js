'use strict';

var parser = require('../parser'),
    template = require('../template'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - option value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 *   (Number) syncLevel - indicates scope of the sync report request.
 *   (String) syncToken - synchronization token provided by the server.
 */
module.exports = function(options) {
  function transformResponse(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    var responses = multistatus.response.map(function(response) {
      return { href: response.href, props: util.getProps(response.propstat) };
    });

    return { responses: responses, syncToken: multistatus.syncToken };
  }

  return {
    method: 'REPORT',
    data: template.syncCollection(options),
    transformResponse: transformResponse,
    depth: options.depth
  };
};
