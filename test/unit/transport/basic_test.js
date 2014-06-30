'use strict';

var XMLHttpRequest = require('../../../lib/transport/xmlhttprequest'),
    assert = require('chai').assert,
    createSandbox = require('../../../lib').createSandbox,
    model = require('../../../lib/model'),
    nock = require('nock'),
    sinon = require('sinon'),
    transport = require('../../../lib/transport');

suite('Basic#send', function() {
  var xhr, req;

  setup(function() {
    xhr = new transport.Basic(
      new model.Credentials({ username: 'admin', password: 'admin' })
    );

    req = {
      method: 'GET',
      transformRequest: function() {}
    };
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should sandbox xhr', function() {
    var sandbox = createSandbox();
    assert.lengthOf(sandbox.requestList, 0);
    xhr.send(req, 'http://127.0.0.1:1337', { sandbox: sandbox });
    assert.lengthOf(sandbox.requestList, 1);
  });

  test('should apply `transformRequest`', function() {
    var stub = sinon.stub(req, 'transformRequest');
    xhr.send(req, 'http://127.0.0.1:1337');
    sinon.assert.called(stub);
  });

  test('should send req', function() {
    var nockObj = nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200, '200 OK');

    assert.notOk(nockObj.isDone());
    xhr.send(req, 'http://127.0.0.1:1337')
    .then(function() {
      assert.ok(nockObj.isDone());
    });
  });

  test('should invoke onerror if error thrown', function(done) {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(400, '400 Bad Request');

    req.onerror = function(error) {
      assert.instanceOf(error, Error);
      assert.include(error.toString(), 'Bad status: 400');
      done();
    };

    xhr.send(req, 'http://127.0.0.1:1337');
  });

  test('should return promise that resolves with xhr', function() {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200, '200 OK');

    return xhr.send(req, 'http://127.0.0.1:1337')
    .then(function(value) {
      assert.instanceOf(value, XMLHttpRequest);
      assert.strictEqual(value.native.readyState, 4);
    });
  });
});
