'use strict';

var XMLHttpRequest = require('../../../lib/transport/xmlhttprequest'),
    assert = require('chai').assert,
    createSandbox = require('../../../lib').createSandbox,
    nock = require('nock'),
    sinon = require('sinon');

suite('XMLHttpRequest#send', function() {
  var request;

  setup(function() {
    request = new XMLHttpRequest();
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should sandbox request if provided', function() {
    nock('http://127.0.0.1:1337').get('/');

    request.open('GET', 'http://127.0.0.1:1337', true);
    var sandbox = createSandbox();
    request.sandbox = sandbox;
    var spy = sinon.spy(request, 'abort');
    request.send();
    sandbox.abort();
    sinon.assert.calledOnce(spy);
  });

  test('should send data if provided', function() {
    nock('http://127.0.0.1:1337')
      .post('/', 'zippity-doo-dah')
      .reply(200, 'zip-a-dee-a');

    request.open('POST', 'http://127.0.0.1:1337', true);
    return request
      .send('zippity-doo-dah')
      .then(function(responseText) {
        assert.strictEqual(responseText, 'zip-a-dee-a');
      });
  });

  test('should reject with statusText if status >=400', function() {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(500, '500 Internal Server Error');

    request.open('GET', 'http://127.0.0.1:1337', true);
    return request.send()
    .then(function() {
      assert.fail('Did not reject promise on xhr error.');
    })
    .catch(function(error) {
      assert.instanceOf(error, Error);
    });
  });

  test('should reject with timeout error on timeout', function() {
    nock('http://127.0.0.1:1337')
      .get('/')
      .delay(2)
      .reply(200, '200 OK');

    request.timeout = 1;
    request.open('GET', 'http://127.0.0.1:1337', true);
    return request.send()
    .then(function() {
      assert.fail('Did not reject promise on timeout.');
    })
    .catch(function(error) {
      assert.instanceOf(error, Error);
    });
  });

  test('should resolve with responseText if everything ok', function() {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200, '200 OK');

    request.open('GET', 'http://127.0.0.1:1337', true);
    return request.send()
    .then(function(responseText) {
      assert.strictEqual(responseText.trim(), '200 OK');
    });
  });
});
