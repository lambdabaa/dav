import XMLHttpRequest from '../../../lib/xmlhttprequest';
import { assert } from 'chai';
import { createSandbox } from '../../../lib/sandbox';
import { Credentials } from '../../../lib/model';
import nock from 'nock';
import sinon from 'sinon';
import { Basic } from '../../../lib/transport';

suite('Basic#send', function() {
  let xhr, req;

  setup(function() {
    xhr = new Basic(
      new Credentials({ username: 'admin', password: 'admin' })
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
    let sandbox = createSandbox();
    assert.lengthOf(sandbox.requestList, 0);
    xhr.send(req, 'http://127.0.0.1:1337', { sandbox: sandbox });
    assert.lengthOf(sandbox.requestList, 1);
  });

  test('should apply `transformRequest`', function() {
    let stub = sinon.stub(req, 'transformRequest');
    xhr.send(req, 'http://127.0.0.1:1337');
    sinon.assert.called(stub);
  });

  test('should send req', async function() {
    let nockObj = nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200, '200 OK');

    assert.notOk(nockObj.isDone());
    await xhr.send(req, 'http://127.0.0.1:1337');
    assert.ok(nockObj.isDone());
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

  test('should return promise that resolves with xhr', async function() {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200, '200 OK');

    let value = await xhr.send(req, 'http://127.0.0.1:1337');
    assert.instanceOf(value, XMLHttpRequest);
    assert.strictEqual(value.request.readyState, 4);
  });
});
