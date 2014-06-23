'use strict';

var XMLHttpRequest = require('./xmlhttprequest');

/**
 * @param {dav.Credentials} credentials user authorization.
 */
function Basic(credentials) {
  this.credentials = credentials;
}
module.exports = Basic;

/**
 * @param {dav.Request} request object with request info.
 * @return {Promise} a promise that will be resolved with an xhr request after
 *     its readyState is 4 or the result of applying an optional request
 *     `transformResponse` function to the xhr object after its readyState is 4.
 *
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 */
Basic.prototype.send = function(request, options) {
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
    request.url,
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
