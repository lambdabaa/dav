'use strict';

var assert = require('assert'),
    helpers = require('../../../lib/template/helpers');

suite('Handlebars helpers', function() {
  test('comp-filter', function() {
    var filter = helpers
      .filterHelper({
        type: 'comp',
        name: 'VCALENDAR',
        namespace: 'c'
      })
      .string;

    assert.strictEqual(filter, '<c:comp-filter name="VCALENDAR" />');
  });

  test('prop', function() {
    var prop = helpers
      .propHelper({
        name: 'spongebob',
        namespace: 'c'
      }, 'D')
      .string;

    assert.strictEqual(prop, '<c:spongebob />');
  });
});
