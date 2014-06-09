'use strict';

var assert = require('chai').assert,
    data = require('../data'),
    parser = require('../../../lib/parser');

suite('parser.multistatus', function() {
  test('propfind (current-user-principal)', function() {
    var currentUserPrincipal = data.currentUserPrincipal;
    assert.deepEqual(parser.multistatus(currentUserPrincipal), [{
      href: '/',
      propstats: [
        {
          prop: {
            'current-user-principal': { href: '/principals/admin/' }
          },
          status: 'HTTP/1.1 200 OK'
        }
      ]
    }]);
  });

  test('report (calendar-query)', function() {
    var calendarQuery = data.calendarQuery;
    assert.deepEqual(parser.multistatus(calendarQuery), [
      {
        href: '/calendars/johndoe/home/132456762153245.ics',
        propstats: [
          {
            prop: {
              getetag: '"2134-314"',
              'calendar-data': 'BEGIN:VCALENDAR\nEND:VCALENDAR'
            },
            status: 'HTTP/1.1 200 OK'
          }
        ]
      },
      {
        href: '/calendars/johndoe/home/132456-34365.ics',
        propstats: [
          {
            prop: {
              getetag: '"5467-323"',
              'calendar-data': 'BEGIN:VCALENDAR\nEND:VCALENDAR'
            },
            status: 'HTTP/1.1 200 OK'
          }
        ]
      },
    ]);
  });
});
