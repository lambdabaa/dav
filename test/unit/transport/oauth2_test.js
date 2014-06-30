/* jshint -W106 */
'use strict';

var XMLHttpRequest = require('../../../lib/transport/xmlhttprequest'),
    assert = require('chai').assert,
    model = require('../../../lib/model'),
    nock = require('nock'),
    sinon = require('sinon'),
    transport = require('../../../lib/transport');

suite('OAuth2#send', function() {
  var xhr, req, credentials;

  setup(function() {
    credentials = new model.Credentials({
      clientId: '605300196874-1ki833poa7uqabmh3hq' +
                '6u1onlqlsi54h.apps.googleusercontent.com',
      clientSecret: 'jQTKlOhF-RclGaGJot3HIcVf',
      redirectUrl: 'https://oauth.gaiamobile.org/authenticated',
      tokenUrl: 'https://accounts.google.com/o/oauth2/token',
      authorizationCode: 'gareth'
    });

    xhr = new transport.OAuth2(credentials);

    req = { method: 'GET' };
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should get access token', function() {
    var access = nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(
        200,
        JSON.stringify({
          access_token: 'sosafesosecret',
          refresh_token: 'lemonade!!1',
          expires_in: 12345
        })
      );

    var mock = nock('http://127.0.0.1:1337')
      .get('/')
      .matchHeader('Authorization', 'Bearer sosafesosecret')
      .reply(200);

    return xhr.send(req, 'http://127.0.0.1:1337', { retry: false })
    .then(function(response) {
      assert.instanceOf(response, XMLHttpRequest);
      assert.ok(access.isDone(), 'should get access');
      assert.strictEqual(credentials.accessToken, 'sosafesosecret');
      assert.strictEqual(credentials.refreshToken, 'lemonade!!1');
      assert.operator(credentials.expiration, '>', Date.now());
      assert.ok(mock.isDone(), 'should send req with Authorization header');
    });
  });

  test('should refresh access token if expired', function() {
    var refresh = nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(
        200,
        JSON.stringify({
          access_token: 'Little Bear',
          expires_in: 314159
        })
      );

    var mock = nock('http://127.0.0.1:1337')
      .get('/')
      .matchHeader('Authorization', 'Bearer Little Bear')
      .reply(200, '200 OK');

    credentials.accessToken = 'EXPIRED';
    credentials.refreshToken = '1/oPHTPFgECWFPrs7KgHdis24u6Xl4E4EnRrkkiwLfzdk';
    credentials.expiration = Date.now() - 1;

    return xhr.send(req, 'http://127.0.0.1:1337', { retry: false })
    .then(function(response) {
      assert.instanceOf(response, XMLHttpRequest);
      assert.ok(refresh.isDone(), 'should refresh');
      assert.strictEqual(credentials.accessToken, 'Little Bear');
      assert.typeOf(credentials.expiration, 'number');
      assert.operator(credentials.expiration, '>', Date.now());
      assert.ok(mock.isDone(), 'should send req with Authorization header');
    });
  });

  test('should use provided access token if not expired', function() {
    var token = nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(500);

    var mock = nock('http://127.0.0.1:1337')
      .get('/')
      .matchHeader('Authorization', 'Bearer Little Bear')
      .reply(200, '200 OK');

    credentials.accessToken = 'Little Bear';
    credentials.refreshToken = 'spicy tamales';
    var expiration = credentials.expiration = Date.now() + 60 * 60 * 1000;

    return xhr.send(req, 'http://127.0.0.1:1337', { retry: false })
    .then(function(response) {
      assert.instanceOf(response, XMLHttpRequest);
      assert.notOk(token.isDone(), 'should not fetch new token(s)');
      assert.strictEqual(credentials.accessToken, 'Little Bear');
      assert.strictEqual(credentials.refreshToken, 'spicy tamales');
      assert.strictEqual(expiration, credentials.expiration);
      assert.ok(mock.isDone());
    });
  });

  test('should retry if 401', function() {
    var refresh = nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(
        200,
        JSON.stringify({
          access_token: 'Little Bear',
          expires_in: 314159
        })
      );

    var authorized = nock('http://127.0.0.1:1337')
      .get('/')
      .matchHeader('Authorization', 'Bearer Little Bear')
      .reply(200, '200 OK');

    var unauthorized = nock('http://127.0.0.1:1337')
      .get('/')
      .matchHeader('Authorization', 'Bearer EXPIRED')
      .reply(401, '401 Unauthorized');

    credentials.accessToken = 'EXPIRED';
    credentials.refreshToken = 'raspberry pie';
    credentials.expiration = Date.now() + 60 * 60 * 1000;

    return xhr.send(req, 'http://127.0.0.1:1337')
    .then(function(response) {
      assert.instanceOf(response, XMLHttpRequest);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.responseText, '200 OK');
      assert.ok(unauthorized.isDone(), 'tried to use expired access token');
      assert.ok(refresh.isDone(), 'should refresh access token on 401');
      assert.strictEqual(credentials.accessToken, 'Little Bear');
      assert.operator(credentials.expiration, '>', Date.now());
      assert.ok(authorized.isDone(), 'should then use new access token');
    });
  });

  test('should retry once at most', function() {
    var refresh = nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(
        200,
        JSON.stringify({
          access_token: 'EXPIRED',
          expires_in: 314159
        })
      );

    nock('http://127.0.0.1:1337')
      .persist()
      .get('/')
      .matchHeader('Authorization', 'Bearer EXPIRED')
      .reply(401, '401 Unauthorized');

    credentials.accessToken = 'EXPIRED';
    credentials.refreshToken = 'soda';

    var spy = sinon.spy(xhr, 'send');

    return xhr.send(req, 'http://127.0.0.1:1337')
    .catch(function(error) {
      assert.instanceOf(error, Error);
      assert.include(error.toString(), 'Bad status: 401');
      assert.ok(refresh.isDone(), 'should refresh access token on 401');
      assert.strictEqual(spy.callCount, 2);
      spy.restore();
    });
  });
});
