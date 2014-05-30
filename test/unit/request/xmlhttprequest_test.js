var XMLHttpRequest = require('../../../lib/request/xmlhttprequest'),
    assert = require('chai').assert,
    createSandbox = require('../../../lib/sandbox'),
    sinon = require('sinon');

suite('XMLHttpRequest#send', function() {
  var subject;

  setup(function() {
    subject = new XMLHttpRequest();
  });

  test('should sandbox request if provided', function() {
    subject.open('GET', 'http://127.0.0.1:9999', true);
    var sandbox = createSandbox();
    subject.sandbox = sandbox;
    var spy = sinon.spy(subject, 'abort');
    subject.send();
    sandbox.abort();
    sinon.assert.calledOnce(spy);
  });

  test('should send data if provided', function() {
    subject.open('POST', 'http://127.0.0.1:9999/echo', true);
    return subject
      .send('zippity-doo-dah')
      .then(function(responseText) {
        assert.strictEqual(responseText, 'zippity-doo-dah');
      });
  });

  test('should reject with statusText if status >=400', function() {
    subject.open('GET', 'http://127.0.0.1:9999/error', true);
    return subject
      .send()
      .then(function() {
        assert.fail('Did not reject promise on xhr error.');
      })
      .catch(function(error) {
        assert.instanceOf(error, Error);
      });
  });

  test('should reject with timeout error on timeout', function() {
    subject.timeout = 1;
    subject.open('GET', 'http://127.0.0.1:9999/timeout', true);
    return subject
      .send()
      .then(function() {
        assert.fail('Did not reject promise on timeout.');
      })
      .catch(function(error) {
        assert.instanceOf(error, Error);
      });
  });

  test('should resolve with responseText if everything ok', function() {
    subject.open('GET', 'http://127.0.0.1:9999', true);
    return subject
      .send()
      .then(function(responseText) {
        assert.strictEqual(responseText.trim(), '200 OK');
      });
  });
});
