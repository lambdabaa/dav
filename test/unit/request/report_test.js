'use strict';
var nock = require('nock'),
    nockUtils = require('./nock_utils'),
    request = require('../../../lib/request');

suite('request.report', function() {
  teardown(function() {
    nock.cleanAll();
  });

  test('should set depth header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', 1)
      .intercept('/principals/admin/', 'REPORT')
      .reply(200);

    var req = request.report({
      url: 'http://127.0.0.1:1337/principals/admin/',
      username: 'abc',
      password: '123',
      props: [ { name: 'calendar-data', namespace: 'c' } ],
      depth: 1
    });

    return nockUtils.verifyNock(req, mock);
  });

  test('should add specified props to report body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', function(body) {
      return body.indexOf('<D:catdog />') !== -1;
    });

    var req = request.report({
      url: 'http://127.0.0.1:1337/principals/admin/',
      username: 'abc',
      password: '123',
      props: [ { name: 'catdog', namespace: 'DAV' } ]
    });

    return nockUtils.verifyNock(req, mock);
  });

  test.skip('should add specified filters to report body', function() {
    // TODO
  });
});
