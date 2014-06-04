'use strict';
var assert = require('chai').assert,
    data = require('../data'),
    parser = require('../../../lib/parser');

suite('parser.multistatus', function() {
  test('propfind (current-user-principal)', function() {
    var currentUserPrincipal = data.currentUserPrincipal;
    assert.deepEqual(parser.multistatus(currentUserPrincipal), {
      href: '/',
      propstats: [
        {
          prop: {
            'current-user-principal': { href: '/principals/admin/' }
          },
          status: 'HTTP/1.1 200 OK'
        }
      ]
    });
  });

  test.skip('report (calendar-query)', function() {
    // TODO(gareth)
  });
});
