'use strict';

var assert = require('chai').assert,
    data = require('../data'),
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
      props: [ { name: 'address-data', namespace: ns.CARDDAV } ],
      depth: 1
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should add specified props to report body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', function(body) {
      return body.indexOf('<d:catdog />') !== -1;
    });

    var req = request.addressBookQuery({
      props: [ { name: 'catdog', namespace: ns.DAV } ]
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should resolve with appropriate data structure', function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'REPORT')
      .reply(200, data.addressBookQuery);


    var req = request.addressBookQuery({
      props: [
        { name: 'getetag', namespace: ns.DAV },
        { name: 'address-data', namespace: ns.CARDDAV }
      ]
    });

    return xhr.send(req, 'http://127.0.0.1:1337/')
    .then(function(addressBooks) {
      assert.lengthOf(addressBooks, 2);
      addressBooks.forEach(function(addressBook) {
        assert.typeOf(addressBook.href, 'string');
        assert.operator(addressBook.href.length, '>', 0);
        assert.typeOf(addressBook.props, 'object');
      });
    });
  });
});
