'use strict';

var Request = require('./request'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) data - put request body.
 *   (String) method - http method.
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
    method: options.method,
    url: options.url,
    requestData: options.data,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
};
