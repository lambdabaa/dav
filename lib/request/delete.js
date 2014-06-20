'use strict';

var Request = require('./request'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) etag - cached calendar object etag.
 *   (String) url - endpoint to request.
 */
module.exports = function(options) {
  function transformRequest(xhr) {
    util.setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    if (xhr.status < 200 || xhr.status > 300) {
      throw new Error('Bad status: ' + xhr.status);
    }
  }

  return new Request({
    method: 'DELETE',
    url: options.url,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
};
