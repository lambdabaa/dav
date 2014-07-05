'use strict';

var Request = require('./request'),
    parser = require('../parser'),
    util = require('./util');

module.exports = function(requestData, options) {
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
    requestData: requestData,
    transformRequest: transformRequest,
    transformResponse: transformResponse
  });
};
