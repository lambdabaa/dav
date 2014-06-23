'use strict';
var assert = require('chai').assert;

exports.extend = function(nockObj) {
  // This is a hack suggested here https://github.com/pgte/nock#protip
  // to intercept the request conditional on the request body.
  nockObj.matchRequestBody = function(path, method, match, options) {
    options = options || {};
    var statusCode = options.statusCode || 200,
        statusText = options.statusText || '200 OK';
    return nockObj
      .filteringRequestBody(function(body) {
        return match(body) ? '*' : '';
      })
      .intercept(path, method, '*')
      .delay(1)
      .reply(statusCode, statusText);
  };

  return nockObj;
};

/**
 * Whether or not an error is thrown in the promise,
 * the mock should have intercepted the request.
 */
exports.verifyNock = function(promise, nockObj) {
  return promise
  .then(function() {
    nockObj.done();
  })
  .catch(function(error) {
    assert.notInclude(error.toString(), 'ECONNREFUSED');
    nockObj.done();
  });
};
