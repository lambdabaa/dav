'use strict';

var assert = require('chai').assert,
    davinci = require('../../lib');

suite('accounts', function() {
  suite('#create', function() {
    var account;

    setup(function() {
      var xhr = new davinci.transport.Basic(
        new davinci.Credentials({
          username: 'admin',
          password: 'admin'
        })
      );

      return davinci.createAccount({
        server: 'http://127.0.0.1:8888/',
        xhr: xhr
      })
      .then(function(response) {
        account = response;
      });
    });

    test('should get existing account', function() {
      assert.instanceOf(account, davinci.Account);
      assert.instanceOf(account.credentials, davinci.Credentials);
      assert.strictEqual(account.credentials.username, 'admin');
      assert.strictEqual(account.credentials.password, 'admin');
      assert.strictEqual(account.server, 'http://127.0.0.1:8888/');
      assert.strictEqual(account.caldavUrl, 'http://127.0.0.1:8888/');
      assert.strictEqual(
        account.principalUrl,
        'http://127.0.0.1:8888/principals/admin/'
      );
      assert.strictEqual(
        account.homeUrl,
        'http://127.0.0.1:8888/calendars/admin/'
      );

      var calendars = account.calendars;
      assert.lengthOf(calendars, 1);
      var calendar = calendars[0];
      assert.instanceOf(calendar, davinci.Calendar);
      assert.strictEqual(calendar.displayName, 'default calendar');
      assert.strictEqual(
        calendar.url,
        'http://127.0.0.1:8888/calendars/admin/default/'
      );
      assert.strictEqual(calendar.description, 'administrator calendar');
      assert.include(calendar.components, 'VEVENT');
      assert.typeOf(calendar.ctag, 'string');
      assert.isArray(calendar.objects);
      assert.lengthOf(calendar.objects, 0);
      assert.isArray(calendar.reports);
      assert.include(calendar.reports, 'calendar-query');
      assert.typeOf(calendar.syncToken, 'string');
      assert.operator(calendar.syncToken.length, '>', 0);
    });
  });
});
