'use strict';

var Request = require('./request'),
    parser = require('../parser'),
    template = require('../template'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<CaldavFilter>) filters - list of filters to send with request.
 *   (Array.<Prop>) props - list of props to request.
 *   (String) timezone - VTIMEZONE calendar object.
 *   (String) url - endpoint to request.
 */
function CalendarQuery(options) {
  this.transformRequest = this.transformRequest.bind(this);
  this.transformResponse = this.transformResponse.bind(this);

  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = CalendarQuery;

CalendarQuery.prototype = {
  /**
   * @type {String}
   */
  depth: null,

  /**
   * @type {Array.<CaldavFilter>}
   */
  filters: null,

  /**
   * @type {Array.<Prop>}
   */
  props: null,

  /**
   * @type {String}
   */
  timezone: null,

  /**
   * @type {String}
   */
  url: null,

  transformRequest: function(xhr) {
    util.setRequestHeaders(xhr, this);
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
    var data = template.calendarQuery({
      props: this.props,
      filters: this.filters,
      timezone: this.timezone
    });

    return new Request({
      method: 'REPORT',
      url: options.url,
      requestData: data,
      transformRequest: this.transformRequest,
      transformResponse: this.transformResponse
    });
  }
};
