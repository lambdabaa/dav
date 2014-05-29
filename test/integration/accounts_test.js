var assert = require('chai').assert;

suite('accounts', function() {
  var subject = require('../../lib/accounts');

  suite('#create', function() {
    var result;

    setup(function() {
      return subject.create({
        username: 'admin',
        password: 'admin',
        server: 'http://127.0.0.1:8888'
      })
      .then(function(response) {
        result = response;
      });
    });

    /**
     * {
     *   href: '/',
     *   propstats: [
     *     {
     *       prop: [
     *         {
     *           current-user-principal: [
     *             { href: '/principals/admin/' }
     *           ]
     *         }
     *       ],
     *       status: '200 OK'
     *     }
     *   ]
     * }
     */
    test('current-user-principal', function() {
      assert.strictEqual(result.href, '/');
      var propstats = result.propstats;
      assert.lengthOf(propstats, 1);
      var propstat = propstats[0];
      var prop = propstat.prop;
      assert.lengthOf(prop, 1);
      var data = prop[0];
      assert.deepEqual(data, {
        'current-user-principal': [ { href: '/principals/admin/' } ]
      });
      assert.include(propstat.status, '200');
    });
  });
});
