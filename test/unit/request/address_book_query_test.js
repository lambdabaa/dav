'use strict';

var assert = require('chai').assert,
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    ns = require('../../../lib/namespace'),
    request = require('../../../lib/request'),
    transport = require('../../../lib/transport');

suite('request.addressBookQuery', function() {
  var xhr;

  setup(function() {
    xhr = new transport.Basic({ username: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      request.addressBookQuery({
        url: 'http://127.0.0.1:1337/principals/admin',
        props: [],
        depth: 1
      }),
      request.Request
    );
  });

  test('should set depth header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', 1)
      .intercept('/principals/admin/', 'REPORT')
      .reply(200);

    var req = request.addressBookQuery({
      url: 'http://127.0.0.1:1337/principals/admin/',
      props: [ { name: 'address-data', namespace: ns.CARDDAV } ],
      depth: 1
    });

    return nockUtils.verifyNock(xhr.send(req), mock);
  });

  test('should add specified props to report body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', function(body) {
      return body.indexOf('<d:catdog />') !== -1;
    });

    var req = request.addressBookQuery({
      url: 'http://127.0.0.1:1337/principals/admin/',
      props: [ { name: 'catdog', namespace: ns.DAV } ]
    });

    return nockUtils.verifyNock(xhr.send(req), mock);
  });

  test.skip('should resolve with appropriate data structure', function() {
    // TODO(gareth)
  });
});
