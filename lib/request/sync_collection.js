'use strict';

var Request = require('./request'),
    parser = require('../parser'),
    template = require('../template'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - option value for Depth header.
 *   (Array.<Prop>) props - list of props to request.
 *   (Number) syncLevel - indicates scope of the sync report request.
 *   (String) syncToken - synchronization token provided by the server.
 *   (String) url - endpoint to request.
 */
function SyncCollection(options) {
  this.transformRequest = this.transformRequest.bind(this);
  this.transformResponse = this.transformResponse.bind(this);

  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = SyncCollection;

SyncCollection.prototype = {
  /**
   * @type {String}
   */
  depth: null,

  /**
   * @type {Array.<Prop>}
   */
  props: null,

  /**
   * @type {Number}
   */
  syncLevel: null,

  /**
   * @type {String}
   */
  syncToken: null,

  /**
   * @type {String}
   */
  url: null,

  transformRequest: function(xhr) {
    util.setRequestHeaders(xhr, options);
  },

  transformResponse: function(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    var responses = multistatus.response.map(function(response) {
      return { href: response.href, props: util.getProps(response.propstat) };
    });

    return { responses: responses, syncToken: multistatus.syncToken };
  },

  /**
   * @return {dav.request.Request} request object.
   */
  createRequest: function() {
    var data = template.syncCollection({
      props: options.props,
      syncLevel: options.syncLevel,
      syncToken: options.syncToken
    });

    return new Request({
      method: 'REPORT',
      url: this.url,
      requestData: data,
      transformRequest: this.transformRequest,
      transformResponse: this.transformResponse
    });
  }
};
