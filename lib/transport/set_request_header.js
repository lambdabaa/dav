'use strict';

/**
 * @param {XMLHttpRequest} xhr
 * @param {Request} request
 */
module.exports = function(xhr, request) {
  xhr.setRequestHeader('Content-Type', 'application/xml;charset=utf-8');

  if (request.depth != null) {
    xhr.setRequestHeader('Depth', request.depth);
  }

  if (request.etag != null) {
    xhr.setRequestHeader('If-Match', request.etag);
  }
};
