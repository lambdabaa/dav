'use strict';

var assert = require('chai').assert,
    dav = require('../../../lib');

suite('AddressBook', function() {
  test('jsonify', function() {
    var server = 'http://dav.example.com',
        credentials = new dav.Credentials({
          username: 'Killer BOB',
          password: 'blacklodge'
        }),
        rootUrl = 'http://dav.example.com/carddav',
        ctag = 'abc123',
        displayName = 'default',
        reports = [
          'addressbook-query'
        ],
        url = 'http://dav.example.com/carddav/Killer BOB/coworkers',
        description = 'Killer BOB coworkers',
        syncToken = 'http://dav.example.com/carddav/sync/0';

    var account = new dav.Account({
      server: server,
      credentials: credentials,
      rootUrl: rootUrl
    });

    var calendar = new dav.AddressBook({
      account: account,
      ctag: ctag,
      displayName: displayName,
      reports: reports,
      url: url,
      description: description,
      syncToken: syncToken
    });

    account.calendars = [calendar];

    var json = dav.jsonify(calendar);
    assert.strictEqual(json.account.server, server);
    assert.deepEqual(json.account.credentials, {
      username: 'Killer BOB',
      password: 'blacklodge'
    });
    assert.strictEqual(json.account.rootUrl, rootUrl);
    assert.deepEqual(json.account.calendars, ['[Circular ~]']);
    assert.strictEqual(json.ctag, calendar.ctag);
    assert.strictEqual(json.displayName, calendar.displayName);
    assert.deepEqual(json.reports, calendar.reports);
    assert.strictEqual(json.url, url);
    assert.strictEqual(json.description, description);
    assert.strictEqual(json.syncToken, syncToken);
  });
});
