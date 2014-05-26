var XMLHttpRequest = require('../lib/request/xmlhttprequest'),
    assert = require('chai').assert,
    createSandbox = require('../lib/sandbox'),
    sinon = require('sinon');

describe('sandbox', function() {
  var subject;

  setup(function() {
    subject = createSandbox();
  });

  test('#add', function() {
    assert.lengthOf(subject.requestList, 0);
    var one = new XMLHttpRequest(),
        two = new XMLHttpRequest();
    subject.add(one);
    subject.add(two);
    assert.lengthOf(subject.requestList, 2);
    assert.include(subject.requestList, one);
    assert.include(subject.requestList, two);
  });

  test('#abort', function() {
    var one = new XMLHttpRequest(),
        two = new XMLHttpRequest();
    subject.add(one);
    subject.add(two);
    var stubOne = sinon.stub(one, 'abort'),
        stubTwo = sinon.stub(two, 'abort');
    subject.abort();
    sinon.assert.calledOnce(stubOne);
    sinon.assert.calledOnce(stubTwo);
  });
});
