'use strict';

var Request = require('./request');

/**
 * Options:
 *   (String) url - endpoint to request.
 *   (String) data - put request body.
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (Object) sandbox - optional request sandbox.
 */
module.exports = function(options) {
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
    transformResponse: transformResponse
  });
};
