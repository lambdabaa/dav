'use strict';

var assert = require('chai').assert,
    nock = require('nock'),
    request = require('../../../lib/request'),
    transport = require('../../../lib/transport');

suite('request.discovery', function() {
  var xhr;

  setup(function() {
    xhr = new transport.Basic({ user: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      request.discovery({
        bootstrap: 'caldav',
        server: 'http://127.0.0.1:1337'
      }),
      request.Request
    );
  });

  test('should read "Location" response header if redirect', function() {
    nock('http://127.0.0.1:1337')
      .get('/.well-known/caldav')
      .reply(301, '301 Moved Permanently', {
        'Location': '/servlet/caldav'
      });

    var req = request.discovery({
      bootstrap: 'caldav',
      server: 'http://127.0.0.1:1337'
    });

    return xhr.send(req)
    .then(function(contextPath) {
      assert.strictEqual(contextPath, 'http://127.0.0.1:1337/servlet/caldav');
    });
  });

  test('should swallow request errors', function() {
    nock('http://127.0.0.1:1337')
      .get('/.well-known/caldav')
      .reply(500, '500 Internal Server Error');

    // If we don't swallow the error, this will throw it.
    var req = request.discovery({
      bootstrap: 'caldav',
      server: 'http://127.0.0.1:1337'
    });

    return xhr.send(req);
  });

  test('should fall back to provided url if not redirect', function() {
    nock('http://127.0.0.1:1337')
      .get('/.well-known/caldav')
      .reply(200, '200 OK');  // 200 is not a redirect.

    var req = request.discovery({
      bootstrap: 'caldav',
      server: 'http://127.0.0.1:1337'
    });

    return xhr.send(req)
    .then(function(contextPath) {
      assert.strictEqual(contextPath, 'http://127.0.0.1:1337/');
    });
  });
});
