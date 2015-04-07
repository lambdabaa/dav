'use strict';

var assert = require('chai').assert,
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    transport = require('../../../lib/transport');

suite('put', function() {
  var xhr;

  setup(function() {
    xhr = new transport.Basic({ user: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should set If-Match header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('If-Match', '1337')
      .intercept('/', 'PUT')
      .reply(200);

    var req = {
      method: 'PUT',
      etag: '1337'
    };

    return nockUtils.verifyNock(xhr.send(req, 'http://127.0.0.1:1337'), mock);
  });

  test('should send options data as request body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/', 'PUT', function(body) {
      return body === 'Bad hair day!';
    });

    var req = {
      method: 'PUT',
      data: 'Bad hair day!'
    };

    return nockUtils.verifyNock(xhr.send(req, 'http://127.0.0.1:1337'), mock);
  });

  test('should throw error on bad response', function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'PUT')
      .delay(1)
      .reply('400', '400 Bad Request');

    var req = { method: 'PUT' };

    return xhr.send(req, 'http://127.0.0.1:1337')
    .then(function() {
      assert.fail('request.basic should have thrown an error');
    })
    .catch(function(error) {
      assert.instanceOf(error, Error);
      assert.include(error.toString(), 'Bad status: 400');
    });
  });
});
