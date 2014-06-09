'use strict';

var assert = require('chai').assert,
    discovery = require('../../../lib/request').discovery,
    nock = require('nock');

suite('request.discovery', function() {
  teardown(function() {
    nock.cleanAll();
  });

  test('should read "Location" response header if redirect', function() {
    nock('http://127.0.0.1:1337')
      .get('/.well-known/caldav')
      .reply(301, '301 Moved Permanently', {
        'Location': '/servlet/caldav'
      });

    return discovery({
      bootstrap: 'caldav',
      server: 'http://127.0.0.1:1337',
      user: 'ernie',
      password: 'bert'
    })
    .then(function(contextPath) {
      assert.strictEqual(contextPath, 'http://127.0.0.1:1337/servlet/caldav');
    });
  });

  test('should swallow request errors', function() {
    nock('http://127.0.0.1:1337')
      .get('/.well-known/caldav')
      .reply(500, '500 Internal Server Error');

    // If we don't swallow the error, this will throw it.
    return discovery({
      bootstrap: 'caldav',
      server: 'http://127.0.0.1:1337',
      user: 'ernie',
      password: 'bert'
    });
  });

  test('should fall back to provided url if not redirect', function() {
    nock('http://127.0.0.1:1337')
      .get('/.well-known/caldav')
      .reply(200, '200 OK');  // 200 is not a redirect.

    return discovery({
      bootstrap: 'caldav',
      server: 'http://127.0.0.1:1337',
      user: 'ernie',
      password: 'bert'
    })
    .then(function(contextPath) {
      assert.strictEqual(contextPath, 'http://127.0.0.1:1337/');
    });
  });
});
