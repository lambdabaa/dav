'use strict';

var setRequestHeader = require('../../../lib/transport/set_request_header'),
    sinon = require('sinon');

suite('setRequestHeader', function() {
  var xhr;

  setup(function() {
    xhr = {
      setRequestHeader: sinon.spy()
    };
  });

  test('should set Content-Type to XML by default', function() {
    setRequestHeader(xhr, { depth: undefined });

    sinon.assert.calledWithExactly(xhr.setRequestHeader,
      'Content-Type', 'application/xml;charset=utf-8');
    sinon.assert.calledOnce(xhr.setRequestHeader);
  });

  test('should set depth and etag if provided', function() {
    setRequestHeader(xhr, { depth: '1234', etag: '789' });

    sinon.assert.calledWithExactly(xhr.setRequestHeader,
      'Content-Type', 'application/xml;charset=utf-8');
    sinon.assert.calledWithExactly(xhr.setRequestHeader,
      'Depth', '1234');
    sinon.assert.calledWithExactly(xhr.setRequestHeader,
      'If-Match', '789');
    sinon.assert.calledThrice(xhr.setRequestHeader);
  });

});
