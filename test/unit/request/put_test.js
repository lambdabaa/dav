'use strict';

var assert = require('chai').assert,
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    request = require('../../../lib/request');

suite('put', function() {
  teardown(function() {
    nock.cleanAll();
  });

  test('should send options data as request body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/', 'PUT', function(body) {
      return body === 'Bad hair day!';
    });

    var req = request.put({
      url: 'http://127.0.0.1:1337/',
      username: 'doug',
      password: 'funny',
      data: 'Bad hair day!'
    });

    return nockUtils.verifyNock(req, mock);
  });

  test('should throw error on bad response', function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'PUT')
      .delay(1)
      .reply('400', '400 Bad Request');

    request.put({
      url: 'http://127.0.0.1:1337/',
      username: 'doug',
      password: 'funny'
    })
    .then(function() {
      assert.fail('request.put should have thrown an error');
    })
    .catch(function(error) {
      assert.instanceOf(error, Error);
      assert.strictEqual(error.msg, 'Bad status: 400');
    });
  });
});
