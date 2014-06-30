'use strict';

var assert = require('chai').assert,
    namespace = require('../../../lib/namespace'),
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    request = require('../../../lib/request'),
    transport = require('../../../lib/transport');

suite('request.syncCollection', function() {
  var xhr;

  setup(function() {
    xhr = new transport.Basic({ username: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      request.syncCollection({
        syncLevel: 1,
        syncToken: 'abc123',
        props: [
          { name: 'getetag', namespace: namespace.DAV },
          { name: 'calendar-data', namespace: namespace.CALDAV }
        ]
      }),
      request.Request
    );
  });

  test('should add props to request body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody(
      '/principals/admin/default/',
      'REPORT',
      function(body) {
        return body.indexOf('<d:getetag />') !== -1 &&
               body.indexOf('<c:calendar-data />') !== -1;
      }
    );

    var req = request.syncCollection({
      syncLevel: 1,
      syncToken: 'abc123',
      props: [
        { name: 'getetag', namespace: namespace.DAV },
        { name: 'calendar-data', namespace: namespace.CALDAV }
      ]
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/default/'),
      mock
    );
  });

  test('should set sync details in request body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody(
      '/principals/admin/default/',
      'REPORT',
      function(body) {
        return body.indexOf('<d:sync-level>1</d:sync-level>') !== -1 &&
               body.indexOf('<d:sync-token>abc123</d:sync-token>') !== -1;
      }
    );

    var req = request.syncCollection({
      syncLevel: 1,
      syncToken: 'abc123',
      props: [
        { name: 'getetag', namespace: namespace.DAV },
        { name: 'calendar-data', namespace: namespace.CALDAV }
      ]
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/default/'),
      mock
    );
  });
});
