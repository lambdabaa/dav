'use strict';

var Transport = require('./transport'),
    XMLHttpRequest = require('./xmlhttprequest'),
    util = require('util');

/**
 * @param {dav.Credentials} credentials user authorization.
 */
function Basic(credentials) {
  Transport.call(this, credentials);
}
util.inherits(Basic, Transport);
module.exports = Basic;

Basic.prototype.send = function(request, url, options) {
  var sandbox = options && options.sandbox,
      transformRequest = request.transformRequest,
      transformResponse = request.transformResponse,
      onerror = request.onerror;

  var xhr = new XMLHttpRequest();

  if (sandbox) {
    sandbox.add(xhr);
  }

  xhr.open(
    request.method,
    url,
    true /* async */,
    this.credentials.username,
    this.credentials.password
  );

  if (transformRequest) {
    transformRequest(xhr);
  }

  var promise = xhr.send(request.requestData)
  .then(function() {
    return transformResponse ? transformResponse(xhr) : xhr;
  });

  if (onerror) {
    promise = promise.catch(onerror);
  }

  return promise;
};
