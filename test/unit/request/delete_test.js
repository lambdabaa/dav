'use strict';

var assert = require('chai').assert,
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    request = require('../../../lib/request');

suite('delete', function() {
  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      request.delete({
        url: 'http://127.0.0.1:1337/',
        username: 'abc',
        password: '123'
      }),
      request.Request
    );
  });

  test('should set If-Match header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('If-Match', '1337')
      .intercept('/', 'DELETE')
      .reply(200);

    var req = request.delete({
      url: 'http://127.0.0.1:1337',
      username: 'abc',
      password: '123',
      etag: '1337'
    });

    return nockUtils.verifyNock(req.send(), mock);
  });

  test('should throw error on bad response', function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'DELETE')
      .delay(1)
      .reply('400', '400 Bad Request');

    request.delete({
      url: 'http://127.0.0.1:1337/',
      username: 'doug',
      password: 'funny'
    })
    .send()
    .then(function() {
      assert.fail('request.delete should have thrown an error');
    })
    .catch(function(error) {
      assert.instanceOf(error, Error);
      assert.strictEqual(error.msg, 'Bad status: 400');
    });
  });
});
