var assert = require('chai').assert,
    fs = require('fs'),
    propfind = require('../../../lib/parser').propfind;

suite('parser.propfind', function() {
  test('current-user-principal', function() {
    var data = fs
      .readFileSync(__dirname + '/../data/current_user_principal.xml', 'utf-8')
      .replace(/>\s+</g, '><');

    assert.deepEqual(propfind(data), {
      href: '/',
      propstats: [
        {
          prop: [
            {
              'current-user-principal': [
                { href: '/principals/admin/' }
              ]
            }
          ],
          status: 'HTTP/1.1 200 OK'
        }
      ]
    });
  });
});
