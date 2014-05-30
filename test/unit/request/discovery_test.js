var assert = require('chai').assert,
    createSandbox = require('../../../lib/sandbox'),
    discovery = require('../../../lib/request').discovery,
    nock = require('nock');

suite('request.discovery', function() {
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
    .then(function(href) {
      assert.strictEqual(href, 'http://127.0.0.1:1337/servlet/caldav');
    });
  });

  test('should swallow request errors', function() {
    nock('http://127.0.0.1:1337')
      .get('/.well-known/caldav')
      .reply(500, '500 Internal Server Error');

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
      .reply(200, '200 OK');

    return discovery({
      bootstrap: 'caldav',
      server: 'http://127.0.0.1:1337',
      user: 'ernie',
      password: 'bert'
    })
    .then(function(href) {
      assert.strictEqual(href, 'http://127.0.0.1:1337/');
    });
  });
});
