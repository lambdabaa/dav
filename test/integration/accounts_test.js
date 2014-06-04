'use strict';
var Calendar = require('../../lib/model').Calendar,
    assert = require('chai').assert;

suite('accounts', function() {
  var accounts = require('../../lib/accounts');

  suite('#create', function() {
    var result;

    setup(function() {
      return accounts.create({
        username: 'admin',
        password: 'admin',
        server: 'http://127.0.0.1:8888'
      })
      .then(function(response) {
        result = response;
      });
    });

    test('should get existing calendar', function() {
      assert.isArray(result);
      assert.lengthOf(result, 1, 'should have one calendar');
      var calendar = result[0];
      assert.instanceOf(calendar, Calendar);
      assert.strictEqual(
        calendar.principalUrl,
        'http://127.0.0.1:8888/principals/admin/'
      );
      assert.strictEqual(calendar.displayName, 'Administrator');
    });
  });
});
