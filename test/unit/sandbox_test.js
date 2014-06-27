'use strict';

var XMLHttpRequest = require('../../lib/transport/xmlhttprequest'),
    assert = require('chai').assert,
    dav = require('../../lib'),
    sinon = require('sinon');

var createSandbox = dav.createSandbox;

suite('sandbox', function() {
  var sandbox;

  setup(function() {
    sandbox = createSandbox();
  });

  test('#add', function() {
    assert.lengthOf(sandbox.requestList, 0);
    var one = new XMLHttpRequest(),
        two = new XMLHttpRequest();
    sandbox.add(one);
    sandbox.add(two);
    assert.lengthOf(sandbox.requestList, 2);
    assert.include(sandbox.requestList, one);
    assert.include(sandbox.requestList, two);
  });

  test('#abort', function() {
    var one = new XMLHttpRequest(),
        two = new XMLHttpRequest();
    sandbox.add(one);
    sandbox.add(two);
    var stubOne = sinon.stub(one, 'abort'),
        stubTwo = sinon.stub(two, 'abort');
    sandbox.abort();
    sinon.assert.calledOnce(stubOne);
    sinon.assert.calledOnce(stubTwo);
  });
});

suite('new sandbox object interface', function() {
  var sandbox;

  setup(function() {
    sandbox = new dav.Sandbox();
  });

  test('constructor', function() {
    assert.instanceOf(sandbox, dav.Sandbox);
  });

  test('#add', function() {
    assert.lengthOf(sandbox.requestList, 0);
    var one = new XMLHttpRequest(),
        two = new XMLHttpRequest();
    sandbox.add(one);
    sandbox.add(two);
    assert.lengthOf(sandbox.requestList, 2);
    assert.include(sandbox.requestList, one);
    assert.include(sandbox.requestList, two);
  });

  test('#abort', function() {
    var one = new XMLHttpRequest(),
        two = new XMLHttpRequest();
    sandbox.add(one);
    sandbox.add(two);
    var stubOne = sinon.stub(one, 'abort'),
        stubTwo = sinon.stub(two, 'abort');
    sandbox.abort();
    sinon.assert.calledOnce(stubOne);
    sinon.assert.calledOnce(stubTwo);
  });
});
