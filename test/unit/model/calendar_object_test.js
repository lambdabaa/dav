'use strict';

var assert = require('chai').assert,
    dav = require('../../../lib');

suite('CalendarObject', function() {
  test('jsonify', function() {
    var server = 'http://dav.example.com',
        credentials = new dav.Credentials({
          username: 'Killer BOB',
          password: 'blacklodge'
        }),
        rootUrl = 'http://dav.example.com/caldav',
        ctag = 'abc123',
        displayName = 'default',
        components = [
          'VEVENT',
          'VTODO'
        ],
        reports = [
          'sync-calendar'
        ],
        calendarUrl = 'http://dav.example.com/caldav/Killer BOB/work',
        description = 'Killer BOB work calendar',
        timezone = 'BEGIN:VTIMEZONE\nTZID:America/New_York\nEND:VTIMEZONE',
        syncToken = 'http://dav.example.com/caldav/sync/0',
        etag = 'cache me if you can',
        calendarData = 'BEGIN:VCALENDAR\nEND:VCALENDAR',
        url = 'http://dav.example.com/caldav/Killer Bob/work/123.ics';

    var account = new dav.Account({
      server: server,
      credentials: credentials,
      rootUrl: rootUrl
    });

    var calendar = new dav.Calendar({
      account: account,
      ctag: ctag,
      displayName: displayName,
      components: components,
      reports: reports,
      url: calendarUrl,
      description: description,
      timezone: timezone,
      syncToken: syncToken
    });

    account.calendars = [calendar];

    var calendarObject = new dav.CalendarObject({
      calendar: calendar,
      etag: etag,
      calendarData: calendarData,
      url: url
    });

    calendar.objects = [calendarObject];

    var json = dav.jsonify(calendarObject);
    assert.strictEqual(json.calendar.account.server, server);
    assert.deepEqual(json.calendar.account.credentials, {
      username: 'Killer BOB',
      password: 'blacklodge'
    });
    assert.strictEqual(json.calendar.account.rootUrl, rootUrl);
    assert.deepEqual(
      json.calendar.account.calendars,
      ['[Circular ~.calendar]']
    );
    assert.strictEqual(json.calendar.ctag, calendar.ctag);
    assert.strictEqual(json.calendar.displayName, calendar.displayName);
    assert.deepEqual(json.calendar.components, calendar.components);
    assert.deepEqual(json.calendar.reports, calendar.reports);
    assert.strictEqual(json.calendar.url, calendarUrl);
    assert.strictEqual(json.calendar.description, description);
    assert.strictEqual(json.calendar.timezone, timezone);
    assert.strictEqual(json.calendar.syncToken, syncToken);
    assert.strictEqual(json.etag, etag);
    assert.strictEqual(json.calendarData, calendarData);
    assert.strictEqual(json.url, url);
  });
});
