var createSandbox = require('../../../lib/sandbox'),
    nock = require('nock'),
    propfind = require('../../../lib/request').propfind;

suite('request.propfind', function() {
  test('should set depth header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', '0')
      .intercept('/', 'PROPFIND')
      .reply(200);

    return propfind({
      url: 'http://127.0.0.1:1337/',
      username: 'abc',
      password: '123',
      props: ['catdog'],
      depth: '0'
    })
    .catch(function() {
      mock.done();
    });
  });

  test('should add specified properties to propfind body', function() {
    var mock = nock('http://127.0.0.1:1337')
      .filteringRequestBody(function(path) {
        return path.indexOf('<D:catdog />') !== -1 ? '*' : ':(';
      })
      .intercept('/', 'PROPFIND', '*')
      .reply(200);

    return propfind({
      url: 'http://127.0.0.1:1337/',
      username: 'abc',
      password: '123',
      props: ['catdog'],
      depth: '0'
    })
    .catch(function() {
      mock.done();
    });
  });
});
