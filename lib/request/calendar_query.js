'use strict';

var Request = require('./request'),
    debug = require('debug')('dav:request:calendar_query'),
    parser = require('../parser'),
    template = require('../template'),
    util = require('./util');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) filters - list of filters to send with request.
 *   (Array.<Object>) props - list of props to request.
 *   (String) timezone - VTIMEZONE calendar object.
 *   (String) url - endpoint to request.
 */
module.exports = function(options) {
  debug('Will send request ' + JSON.stringify(options));

  var requestData = template.calendarQuery({
    props: options.props || [],
    filters: options.filters || [],
    timezone: options.timezone
  });

  function transformRequest(xhr) {
    util.setRequestHeaders(xhr, options);
  }

  function transformResponse(xhr) {
    var multistatus = parser.multistatus(xhr.responseText);
    return multistatus.response.map(function(response) {
      return { href: response.href, props: util.getProps(response.propstat) };
    });
  }

  return new Request({
    method: 'REPORT',
    url: options.url,
    requestData: requestData,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
};
