import { assert } from 'chai';
import nock from 'nock';
import { extend, verifyNock } from './nock_utils';
import { Request, basic } from '../../../lib/request';
import * as transport from '../../../lib/transport';

suite('put', function() {
  let xhr;

  setup(function() {
    xhr = new transport.Basic({ user: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      basic({
        method: 'PUT',
        username: 'abc',
        password: '123',
        data: 'yoyoma'
      }),
      Request
    );
  });

  test('should set If-Match header', function() {
    let mock = nock('http://127.0.0.1:1337')
      .matchHeader('If-Match', '1337')
      .intercept('/', 'PUT')
      .reply(200);

    let req = basic({
      method: 'PUT',
      etag: '1337'
    });

    return verifyNock(xhr.send(req, 'http://127.0.0.1:1337'), mock);
  });

  test('should send options data as request body', function() {
    let mock = extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/', 'PUT', body => {
      return body === 'Bad hair day!';
    });

    let req = basic({
      method: 'PUT',
      data: 'Bad hair day!'
    });

    return verifyNock(xhr.send(req, 'http://127.0.0.1:1337'), mock);
  });

  test('should throw error on bad response', async function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'PUT')
      .delay(1)
      .reply('400', '400 Bad Request');

    let req = basic({ method: 'PUT' });

    try {
      await xhr.send(req, 'http://127.0.0.1:1337')
      assert.fail('request.basic should have thrown an error');
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.include(error.toString(), 'Bad status: 400');
    }
  });
});
