var createSandbox = require('../../../lib/sandbox'),
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    request = require('../../../lib/request');

suite('request.propfind', function() {
  teardown(function() {
    nock.cleanAll();
  });

  test('should set depth header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', '0')  // Will only get intercepted if Depth => 0.
      .intercept('/', 'PROPFIND')
      .reply(200);

    var req = request.propfind({
      url: 'http://127.0.0.1:1337/',
      username: 'abc',
      password: '123',
      props: [ { name: 'catdog', namespace: 'DAV' } ],
      depth: '0'
    });

    return nockUtils.verifyNock(req, mock);
  });

  test('should add specified properties to propfind body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/', 'PROPFIND', function(body) {
      return body.indexOf('<D:catdog />') !== -1;
    });

    var req = request.propfind({
      url: 'http://127.0.0.1:1337/',
      username: 'abc',
      password: '123',
      props: [ { name: 'catdog', namespace: 'DAV' } ],
      depth: '0'
    });

    return nockUtils.verifyNock(req, mock);
  });
});
