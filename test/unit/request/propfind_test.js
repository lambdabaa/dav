'use strict';
var nock = require('nock'),
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

  test('should set prefer header', function() {
    var mock = nock('http://127.0.0.1:1337')
      // Will only intercept if Prefer header set to return-minimal.
      .matchHeader('Prefer', 'return-minimal')
      .intercept('/', 'PROPFIND')
      .reply(200);

    var req = request.propfind({
      url: 'http://127.0.0.1:1337/',
      username: 'abc',
      password: '123',
      props: [ { name: 'catdog', namespace: 'DAV' } ],
      prefer: 'return-minimal'
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

  test.skip('should ignore props that were not found', function() {
    // TODO(gareth)
  });

  test.skip('should throw appropriate error if no propstats', function() {
    // TODO(gareth)
  });

  test.skip('should throw appropriate error if bad status', function() {
    // TODO(gareth)
  });
});
