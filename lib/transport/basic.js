'use strict';

var XMLHttpRequest = require('./xmlhttprequest'),
    model = require('../model');

/**
 * @param {davinci.Credentials} credentials user authorization.
 *
 * Options:
 *
 *   (String) password - plaintext password for basic http authentication.
 *   (String) user - username (perhaps email) for basic http authentication.
 */
function Basic(credentials, options) {
  if (credentials instanceof model.Credentials) {
    this.user = credentials.username;
    this.password = credentials.password;
  } else if (typeof credentials === 'object') {
    options = credentials;
    credentials = null;
  }

  if (options) {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Basic;

/**
 * @param {davinci.Request} request object with request info.
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
    this.user,
    this.password
  );

  if (transformRequest) {
    transformRequest(xhr);
  }

  var promise = xhr.send(request.requestData).then(function() {
    return transformResponse ? transformResponse(xhr) : xhr;
  });

  if (onerror) {
    return promise.catch(onerror);
  }

  return promise;
};
