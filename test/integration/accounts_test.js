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

    test('current-user-principal', function() {
      assert.deepEqual(result, {
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
});
