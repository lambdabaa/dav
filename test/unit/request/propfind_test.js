var createSandbox = require('../../../lib/sandbox'),
    nock = require('nock'),
    propfind = require('../../../lib/request').propfind;

suite('request.propfind', function() {
  teardown(function() {
    nock.cleanAll();
  });

  test('should set depth header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', '0')  // Will only get intercepted if Depth => 0.
      .intercept('/', 'PROPFIND')
      .reply(200);

    return propfind({
      url: 'http://127.0.0.1:1337/',
      username: 'abc',
      password: '123',
      props: ['catdog'],
      depth: '0'
    })
    // Whether or not an error is thrown, the mock should have intercepted
    // the PROPFIND request. Should replace with Promise.prototype.finally.
    .then(function() {
      mock.done();
    })
    .catch(function() {
      mock.done();
    });
  });

  test('should add specified properties to propfind body', function() {
    var mock = nock('http://127.0.0.1:1337');
    // This is a hack suggested here https://github.com/pgte/nock#protip
    // to intercept the request conditional on the request body.
    mock.matchRequestBody = function(path, method, match) {
      return mock.filteringRequestBody(function(body) {
        return match(body) ? '*' : '';
      })
      .intercept(path, method, '*');
    };

    mock.matchRequestBody('/', 'PROPFIND', function(path) {
      return path.indexOf('<D:catdog />') !== -1;
    });

    return propfind({
      url: 'http://127.0.0.1:1337/',
      username: 'abc',
      password: '123',
      props: ['catdog'],
      depth: '0'
    })
    // Whether or not an error is thrown, the mock should have intercepted
    // the PROPFIND request. Should replace with Promise.prototype.finally.
    .then(function() {
      mock.done();
    })
    .catch(function() {
      mock.done();
    });
  });
});
