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
function Basic(options) {
  this.transformRequest = this.transformRequest.bind(this);
  this.transformResponse = this.transformResponse.bind(this);

  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}

Basic.prototype = {
  /**
   * @type {String}
   */
  data: null,

  /**
   * @type {String}
   */
  method: null,

  /**
   * @type {String}
   */
  etag: null,

  /**
   * @type {String}
   */
  url: null,

  transformRequest: function(xhr) {
    util.setRequestHeaders(xhr, this);
  },

  transformResponse: function(xhr) {
    if (xhr.status < 200 || xhr.status > 300) {
      throw new Error('Bad status: ' + xhr.status);
    }
  },

  /**
   * @return {dav.request.Request} request object.
   */
  createRequest: function() {
    return new Request({
      method: this.method,
      url: this.url,
      requestData: this.data,
      transformRequest: this.transformRequest,
      transformResponse: this.transformResponse
    });
  }
};
