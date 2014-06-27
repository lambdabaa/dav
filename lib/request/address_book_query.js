'use strict';

var Request = require('./request'),
    parser = require('../parser'),
    template = require('../template'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Prop>) props - list of props to request.
 *   (String) url - endpoint to request.
 */
function AddressBookQuery(options) {
  this.transformRequest = this.transformRequest.bind(this);
  this.transformResponse = this.transformResponse.bind(this);

  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = AddressBookQuery;

AddressBookQuery.prototype = {
  /**
   * @type {String}
   */
  depth: null,

  /**
   * @type {Array.<Prop>}
   */
  props: null,

  /**
   * @type {String}
   */
  url: null,

  transformRequest: function(xhr) {
    util.setRequestHeaders(xhr, options);
  },

  transformResponse: function(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    return multistatus.response.map(function(response) {
      return { href: response.href, props: util.getProps(response.propstat) };
    });
  },

  /**
   * @return {dav.request.Request} request object.
   */
  createRequest: function() {
    return new Request({
      method: 'REPORT',
      url: this.url,
      requestData: template.addressBookQuery({ props: this.props }),
      transformRequest: this.transformRequest,
      transformResponse: this.transformResponse
    });
  }
};
