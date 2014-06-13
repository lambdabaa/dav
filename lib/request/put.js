'use strict';

var Request = require('./request'),
    dav = require('./dav');

/**
 * Options:
 *   (String) url - endpoint to request.
 *   (String) data - put request body.
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (Object) sandbox - optional request sandbox.
 *   (String) etag - cached calendar object etag.
 *   (Function) transformResponse - hook to optionally override default
 *       xhr response handling.
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
    user: options.username,
    password: options.password,
    requestData: options.data,
    sandbox: options.sandbox,
    transformRequest: transformRequest,
    transformResponse: options.transformResponse || transformResponse
  });
};
