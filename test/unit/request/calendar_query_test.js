'use strict';

var assert = require('chai').assert,
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    request = require('../../../lib/request');

suite('request.calendarQuery', function() {
  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      request.calendarQuery({
        url: 'http://127.0.0.1:1337/principals/admin',
        username: 'abc',
        password: '123',
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

    var req = request.calendarQuery({
      url: 'http://127.0.0.1:1337/principals/admin/',
      username: 'abc',
      password: '123',
      props: [ { name: 'calendar-data', namespace: 'c' } ],
      depth: 1
    });

    return nockUtils.verifyNock(req.send(), mock);
  });

  test('should add specified props to report body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', function(body) {
      return body.indexOf('<d:catdog />') !== -1;
    });

    var req = request.calendarQuery({
      url: 'http://127.0.0.1:1337/principals/admin/',
      username: 'abc',
      password: '123',
      props: [ { name: 'catdog', namespace: 'd' } ]
    });

    return nockUtils.verifyNock(req.send(), mock);
  });

  test.skip('should add specified filters to report body', function() {
    // TODO
  });

  test.skip('should resolve with appropriate data structure', function() {
    // TODO
  });
});
