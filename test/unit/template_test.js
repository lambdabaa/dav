import { assert } from 'chai';

import { filterHelper, propHelper } from '../../lib/template';

suite('Handlebars helpers', function() {
  test('comp-filter', function() {
    let filter = filterHelper({
      type: 'comp-filter',
      attrs: { name: 'VCALENDAR' }
    })
    .string;

    assert.strictEqual(filter, '<c:comp-filter name="VCALENDAR"/>');
  });

  test('time-range', function() {
    let filter = filterHelper({
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
    let filter = filterHelper({
      type: 'time-range',
      attrs: { start: '20060104T000000Z' }
    })
    .string;

    assert.strictEqual(filter, '<c:time-range start="20060104T000000Z"/>');
  });

  test('nested', function() {
    let filter = filterHelper({
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
    let prop = propHelper({
      name: 'spongebob',
      namespace: 'urn:ietf:params:xml:ns:caldav'
    })
    .string;

    assert.strictEqual(prop, '<c:spongebob />');
  });
});
