'use strict';

var Request = require('./request'),
    parser = require('../parser'),
    template = require('../template'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Boolean) mergeResponses - whether or not to merge multistatus responses.
 *   (Array.<Prop>) props - list of props to request.
 *   (String) url - endpoint to request.
 */
function Propfind(options) {
  this.transformRequest = this.transformRequest.bind(this);
  this.transformResponse = this.transformResponse.bind(this);

  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
exports.Propfind = Propfind;

Propfind.prototype = {
  /**
   * One of '0', '1', or 'Infinity'.
   * @type {String}
   */
  depth: null,

  /**
   * @type {Boolean}
   */
  mergeResponses: null,

  /**
   * @type {Array.<Prop>}
   */
  props: null,

  /**
   * @type {String}
   */
  url: null,

  transformRequest: function(xhr) {
    util.setRequestHeaders(xhr, this);
  },

  transformResponse: function(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    var responses = multistatus.response.map(function(response) {
      return {
        href: response.href,
        props: util.getProps(response.propstat)  // propstats => props
      };
    });

    if (!options.mergeResponses) {
      return responses;
    }

    // Merge the props.
    var merged = util.mergeProps(
      responses.map(function(response) {
        return response.props;
      })
    );

    var hrefs = responses.map(function(response) {
      return response.href;
    });

    return { props: merged, hrefs: hrefs };
  },

  /**
   * @return {dav.request.Request} request object.
   */
  createRequest: function() {
    return new Request({
      method: 'PROPFIND',
      url: this.url,
      requestData: template.propfind({ props: this.props }),
      transformRequest: this.transformRequest,
      transformResponse: this.transformResponse
    });
  }
};
