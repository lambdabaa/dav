'use strict';

var assert = require('chai').assert,
    dav = require('../../../lib');

suite('Calendar', function() {
  test('#toString', function() {
    var server = 'http://dav.example.com',
        credentials = new dav.Credentials({
          username: 'Killer BOB',
          password: 'blacklodge'
        }),
        caldavUrl = 'http://dav.example.com/caldav',
        ctag = 'abc123',
        displayName = 'default',
        components = [
          'VEVENT',
          'VTODO'
        ],
        reports = [
          'sync-calendar'
        ],
        url = 'http://dav.example.com/caldav/Killer BOB/work',
        description = 'Killer BOB work calendar',
        timezone = 'BEGIN:VTIMEZONE\nTZID:America/New_York\nEND:VTIMEZONE',
        syncToken = 'http://dav.example.com/caldav/sync/0';

    var account = new dav.Account({
      server: server,
      credentials: credentials,
      caldavUrl: caldavUrl
    });

    var calendar = new dav.Calendar({
      account: account,
      ctag: ctag,
      displayName: displayName,
      components: components,
      reports: reports,
      url: url,
      description: description,
      timezone: timezone,
      syncToken: syncToken
    });

    account.calendars = [calendar];

    var json = JSON.parse(calendar.toString());
    assert.strictEqual(json.account.server, server);
    assert.deepEqual(json.account.credentials, {
      username: 'Killer BOB',
      password: 'blacklodge'
    });
    assert.strictEqual(json.account.caldavUrl, caldavUrl);
    assert.deepEqual(json.account.calendars, ['[Circular ~]']);
    assert.strictEqual(json.ctag, calendar.ctag);
    assert.strictEqual(json.displayName, calendar.displayName);
    assert.deepEqual(json.components, calendar.components);
    assert.deepEqual(json.reports, calendar.reports);
    assert.strictEqual(json.url, url);
    assert.strictEqual(json.description, description);
    assert.strictEqual(json.timezone, timezone);
    assert.strictEqual(json.syncToken, syncToken);
  });
});
