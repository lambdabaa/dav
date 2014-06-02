var assert = require('chai').assert,
    data = require('../data'),
    propfind = require('../../../lib/parser').propfind;

suite('parser.propfind', function() {
  test('current-user-principal', function() {
    var currentUserPrincipal = data.currentUserPrincipal;
    assert.deepEqual(propfind(currentUserPrincipal), {
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
});
