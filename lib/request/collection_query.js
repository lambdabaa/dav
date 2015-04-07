'use strict';

var parser = require('../parser'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (String) data - request data to be sent.
 */
module.exports = function(options) {
  function transformResponse(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    return multistatus.response.map(function(response) {
      return { href: response.href, props: util.getProps(response.propstat) };
    });
  }

  return {
    method: 'REPORT',
    data: options.data,
    transformResponse: transformResponse,
    depth: options.depth
  };
};
