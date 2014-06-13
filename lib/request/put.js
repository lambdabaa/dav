'use strict';

var Request = require('./request'),
    dav = require('./dav');

/**
 * Options:
 *
 *   (String) data - put request body.
 *   (String) etag - cached calendar object etag.
 *   (String) url - endpoint to request.
 */
module.exports = function(options) {
  function transformRequest(xhr) {
    dav.setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    if (xhr.status < 200 || xhr.status > 300) {
      throw new Error('Bad status: ' + xhr.status);
    }
  }

  return new Request({
    method: 'PUT',
    url: options.url,
    requestData: options.data,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
};
