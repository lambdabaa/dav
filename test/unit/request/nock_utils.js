var assert = require('chai').assert;

exports.extend = function(nockObj) {
  // This is a hack suggested here https://github.com/pgte/nock#protip
  // to intercept the request conditional on the request body.
  nockObj.matchRequestBody = function(path, method, match) {
    return nockObj
      .filteringRequestBody(function(body) {
        return match(body) ? '*' : '';
      })
      .intercept(path, method, '*')
      .delay(1)
      .reply(200, '200 OK');
  };

  return nockObj;
};

exports.verifyNock = function(promise, nockObj) {
  return promise
    // Whether or not an error is thrown, the mock should have intercepted
    // the PROPFIND request. Should replace with Promise.prototype.finally.
    .then(function() {
      nockObj.done();
    })
    .catch(function(error) {
      assert.notInclude(error.toString(), 'ECONNREFUSED');
      nockObj.done();
    });
};
