'use strict';

var assert = require('assert'),
    helpers = require('../../../lib/template/helpers');

suite('Handlebars helpers', function() {
  test('comp-filter', function() {
    var filter = helpers.filterHelper({
      type: 'comp-filter',
      attrs: { name: 'VCALENDAR' }
    })
    .string;

    assert.strictEqual(filter, '<c:comp-filter name="VCALENDAR"/>');
  });

  test('time-range', function() {
    var filter = helpers.filterHelper({
      type: 'time-range',
      attrs: { start: '20060104T000000Z', end: '20060105T000000Z' }
    })
    .string;

    assert.strictEqual(
      filter,
      '<c:time-range start="20060104T000000Z" end="20060105T000000Z"/>'
    );
  });

  test('time-range no end', function() {
    var filter = helpers.filterHelper({
      type: 'time-range',
      attrs: { start: '20060104T000000Z' }
    })
    .string;

    assert.strictEqual(filter, '<c:time-range start="20060104T000000Z"/>');
  });

  test('nested', function() {
    var filter = helpers.filterHelper({
      type: 'comp-filter',
      attrs: { name: 'VCALENDAR' },
      children: [{
        type: 'comp-filter',
        attrs: { name: 'VEVENT' },
        children: [{
          type: 'time-range',
          attrs: { start: '20060104T000000Z', end: '20060105T000000Z' }
        }]
      }]
    })
    .string;

    assert.strictEqual(
      filter,
      '<c:comp-filter name="VCALENDAR">' +
      '<c:comp-filter name="VEVENT">' +
      '<c:time-range start="20060104T000000Z" end="20060105T000000Z"/>' +
      '</c:comp-filter>' +
      '</c:comp-filter>'
    );
  });

  test('prop', function() {
    var prop = helpers.propHelper({
      name: 'spongebob',
      namespace: 'urn:ietf:params:xml:ns:caldav'
    })
    .string;

    assert.strictEqual(prop, '<c:spongebob />');
  });
});
