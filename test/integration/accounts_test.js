'use strict';

var assert = require('chai').assert,
    dav = require('../../lib');

suite('accounts', function() {
  suite('#create', function() {
    var xhr;

    setup(function() {
      xhr = new dav.transport.Basic(
        new dav.Credentials({
          username: 'admin',
          password: 'admin'
        })
      );
    });

    test('caldav', function() {
      return dav.createAccount({ server: 'http://127.0.0.1:8888', xhr: xhr })
      .then(function(account) {
        assert.instanceOf(account, dav.Account);
        assert.instanceOf(account.credentials, dav.Credentials);
        assert.strictEqual(account.credentials.username, 'admin');
        assert.strictEqual(account.credentials.password, 'admin');
        assert.strictEqual(account.server, 'http://127.0.0.1:8888');
        assert.strictEqual(account.rootUrl, 'http://127.0.0.1:8888/');
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
        assert.instanceOf(calendar, dav.Calendar);
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
        assert.isArray(calendar.resourcetype);
        assert.include(calendar.resourcetype, 'calendar');
        assert.typeOf(calendar.syncToken, 'string');
        assert.operator(calendar.syncToken.length, '>', 0);
      });
    });

    test('carddav', function() {
      return dav.createAccount({
        server: 'http://127.0.0.1:8888',
        xhr: xhr,
        accountType: 'carddav'
      })
      .then(function(account) {
        assert.instanceOf(account, dav.Account);
        assert.instanceOf(account.credentials, dav.Credentials);
        assert.strictEqual(account.credentials.username, 'admin');
        assert.strictEqual(account.credentials.password, 'admin');
        assert.strictEqual(account.server, 'http://127.0.0.1:8888');
        assert.strictEqual(account.rootUrl, 'http://127.0.0.1:8888/');
        assert.strictEqual(
          account.principalUrl,
          'http://127.0.0.1:8888/principals/admin/'
        );
        assert.strictEqual(
          account.homeUrl,
          'http://127.0.0.1:8888/addressbooks/admin/'
        );

        var addressBooks = account.addressBooks;
        assert.operator(addressBooks.length, '>', 0);
        assert.ok(
          addressBooks.some(function(addressBook) {
            return addressBook instanceof dav.AddressBook &&
                   addressBook.displayName === 'default address book' &&
                   (addressBook.url ===
                    'http://127.0.0.1:8888/addressbooks/admin/default/') &&
                   typeof addressBook.ctag === 'string' &&
                   Array.isArray(addressBook.objects) &&
                   addressBook.objects.length === 0 &&
                   Array.isArray(addressBook.reports) &&
                   addressBook.reports.indexOf('addressbook-query') !== -1 &&
                   Array.isArray(addressBook.resourcetype) &&
                   addressBook.resourcetype.indexOf('addressbook') !== -1 &&
                   typeof addressBook.syncToken === 'string' &&
                   addressBook.syncToken.length > 0;
          })
        );
      });
    });

    test('without loading collections', function() {
      return dav.createAccount({
        server: 'http://127.0.0.1:8888',
        xhr: xhr,
        accountType: 'caldav',
        loadCollections: false
      })
      .then(function(account) {
        assert.instanceOf(account, dav.Account);
        assert.instanceOf(account.credentials, dav.Credentials);
        assert.strictEqual(account.credentials.username, 'admin');
        assert.strictEqual(account.credentials.password, 'admin');
        assert.strictEqual(account.server, 'http://127.0.0.1:8888');
        assert.strictEqual(account.rootUrl, 'http://127.0.0.1:8888/');
        assert.strictEqual(
          account.principalUrl,
          'http://127.0.0.1:8888/principals/admin/'
        );
        assert.strictEqual(
          account.homeUrl,
          'http://127.0.0.1:8888/calendars/admin/'
        );

        var calendars = account.calendars;
        assert.notOk(calendars);
      });
    });

    test('without loading objects', function() {
      return dav.createAccount({
        server: 'http://127.0.0.1:8888',
        xhr: xhr,
        accountType: 'caldav',
        loadObjects: false
      })
      .then(function(account) {
        assert.instanceOf(account, dav.Account);
        assert.instanceOf(account.credentials, dav.Credentials);
        assert.strictEqual(account.credentials.username, 'admin');
        assert.strictEqual(account.credentials.password, 'admin');
        assert.strictEqual(account.server, 'http://127.0.0.1:8888');
        assert.strictEqual(account.rootUrl, 'http://127.0.0.1:8888/');
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
        assert.instanceOf(calendar, dav.Calendar);
        assert.strictEqual(calendar.displayName, 'default calendar');
        assert.strictEqual(
          calendar.url,
          'http://127.0.0.1:8888/calendars/admin/default/'
        );
        assert.strictEqual(calendar.description, 'administrator calendar');
        assert.include(calendar.components, 'VEVENT');
        assert.typeOf(calendar.ctag, 'string');
        assert.notOk(calendar.objects);
        assert.isArray(calendar.reports);
        assert.include(calendar.reports, 'calendar-query');
        assert.isArray(calendar.resourcetype);
        assert.include(calendar.resourcetype, 'calendar');
        assert.typeOf(calendar.syncToken, 'string');
        assert.operator(calendar.syncToken.length, '>', 0);
      });
    });
  });
});
