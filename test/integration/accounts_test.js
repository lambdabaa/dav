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
        server: 'http://127.0.0.1:8888/'
      })
      .then(function(response) {
        result = response;
      });
    });

    test('should get existing calendar', function() {
      assert.lengthOf(result, 1);
      var calendar = result[0];
      assert.instanceOf(calendar, Calendar);
      assert.strictEqual(calendar.username, 'admin');
      assert.strictEqual(calendar.password, 'admin');
      assert.strictEqual(calendar.displayName, 'default calendar');
      assert.strictEqual(
        calendar.url,
        'http://127.0.0.1:8888/calendars/admin/default/'
      );
      assert.include(calendar.components, 'VEVENT');
      assert.typeOf(calendar.ctag, 'string');
    });
  });
});
