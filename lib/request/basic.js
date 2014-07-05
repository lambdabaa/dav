'use strict';

var Request = require('./request'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) data - put request body.
 *   (String) method - http method.
 *   (String) etag - cached calendar object etag.
 */
module.exports = function(options) {
  function transformRequest(xhr) {
    util.setRequestHeaders(xhr, options);
  }

  return new Request({
    method: options.method,
    requestData: options.data,
    transformRequest: transformRequest
  });
};
