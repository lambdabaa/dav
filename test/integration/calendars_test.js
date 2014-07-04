'use strict';

var assert = require('chai').assert,
    data = require('./data'),
    dav = require('../../lib'),
    debug = require('debug')('dav:calendars_test');

suite('calendars', function() {
  var calendars, xhr;

  setup(function() {
    debug('Create account.');
    xhr = new dav.transport.Basic(
      new dav.Credentials({
        username: 'admin',
        password: 'admin'
      })
    );

    return dav.createAccount({ server: 'http://127.0.0.1:8888/', xhr: xhr })
    .then(function(response) {
      var calendar = response.calendars[0];
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 0, 'initially 0 calendar objects');
      debug('Create calendar object.');
      return dav.createCalendarObject(calendar, {
        filename: 'test.ics',
        data: data.bastilleDayParty,
        xhr: xhr
      });
    })
    .then(function() {
      // TODO(gareth): Once we implement account sync,
      //     do that here.
      debug('Fetch account again.');
      return dav.createAccount({
        server: 'http://127.0.0.1:8888/',
        xhr: xhr
      });
    })
    .then(function(response) {
      calendars = response.calendars;
    });
  });

  test('#createCalendarObject', function() {
    var calendar = calendars[0];
    var objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    var object = objects[0];
    assert.instanceOf(object, dav.CalendarObject);
    assert.instanceOf(object.calendar, dav.Calendar);
    assert.strictEqual(object.calendarData, data.bastilleDayParty);
    assert.strictEqual(
      object.url,
      'http://127.0.0.1:8888/calendars/admin/default/test.ics'
    );
  });

  test('#updateCalendarObject, #sync', function() {
    var calendar = calendars[0];
    var object = calendar.objects[0];
    object.calendarData = object.calendarData.replace(
      'SUMMARY:Bastille Day Party',
      'SUMMARY:Happy Hour'
    );

    return dav.updateCalendarObject(object, { xhr: xhr })
    .then(function() {
      return dav.syncCalendar(calendar, { syncMethod: 'basic', xhr: xhr });
    })
    .then(function(calendar) {
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 1, 'update should not create new object');
      var object = objects[0];
      assert.instanceOf(object, dav.CalendarObject);
      assert.instanceOf(object.calendar, dav.Calendar);
      assert.notStrictEqual(
        object.calendarData,
        data.bastilleDayParty,
        'data should have changed on server'
      );
      assert.include(
        object.calendarData,
        'SUMMARY:Happy Hour',
        'data should reflect update'
      );
      assert.notInclude(
        object.calendardata,
        'SUMMARY:Bastille Day Party',
        'data should reflect update'
      );
      assert.strictEqual(
        object.url,
        'http://127.0.0.1:8888/calendars/admin/default/test.ics',
        'update should not change object url'
      );
    });
  });

  test('webdav sync', function() {
    var calendar = calendars[0];
    var object = calendar.objects[0];
    object.calendarData = object.calendarData.replace(
      'SUMMARY:Bastille Day Party',
      'SUMMARY:Happy Hour'
    );

    var prevEtag = object.etag;
    assert.typeOf(prevEtag, 'string');
    assert.operator(prevEtag.length, '>', 0);

    var prevSyncToken = calendar.syncToken;
    assert.typeOf(prevSyncToken, 'string');
    assert.operator(prevSyncToken.length, '>', 0);

    return dav.updateCalendarObject(object, { xhr: xhr })
    .then(function() {
      return dav.syncCalendar(calendar, { syncMethod: 'webdav', xhr: xhr });
    })
    .then(function(calendar) {
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 1, 'update should not create new object');

      var object = objects[0];
      assert.instanceOf(object, dav.CalendarObject);
      assert.instanceOf(object.calendar, dav.Calendar);

      assert.notStrictEqual(
        object.calendarData,
        data.bastilleDayParty,
        'data should have changed on server'
      );

      assert.include(
        object.calendarData,
        'SUMMARY:Happy Hour',
        'data should reflect update'
      );

      assert.notInclude(
        object.calendardata,
        'SUMMARY:Bastille Day Party',
        'data should reflect update'
      );

      assert.strictEqual(
        object.url,
        'http://127.0.0.1:8888/calendars/admin/default/test.ics',
        'update should not change object url'
      );

      assert.typeOf(object.etag, 'string');
      assert.operator(object.etag.length, '>', 0);
      assert.notStrictEqual(prevEtag, object.etag, 'new etag');

      assert.typeOf(calendar.syncToken, 'string');
      assert.operator(calendar.syncToken.length, '>', 0);
      assert.notStrictEqual(calendar.syncToken, prevSyncToken, 'new token');
    });
  });

  test('#deleteCalendarObject', function() {
    var calendar = calendars[0];
    var objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    var object = objects[0];
    return dav.deleteCalendarObject(object, { xhr: xhr })
    .then(function() {
      // TODO(gareth): Once we implement incremental/webdav sync,
      //     do that here.
      return dav.createAccount({
        server: 'http://127.0.0.1:8888/',
        xhr: xhr
      });
    })
    .then(function(response) {
      var calendars = response.calendars;
      var calendar = calendars[0];
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 0, 'should be deleted');
    });
  });

  test('time-range filtering', function() {
    var inrange = dav.createAccount({
      server: 'http://127.0.0.1:8888/',
      filters: [{
        type: 'comp-filter',
        attrs: { name: 'VCALENDAR' },
        children: [{
          type: 'comp-filter',
          attrs: { name: 'VEVENT' },
          children: [{
            type: 'time-range',
            attrs: { start: '19970714T170000Z' }
          }]
        }]
      }],
      xhr: xhr
    })
    .then(function(account) {
      assert.lengthOf(account.calendars[0].objects, 1, 'in range');
    });

    var outofrange = dav.createAccount({
      server: 'http://127.0.0.1:8888/',
      filters: [{
        type: 'comp-filter',
        attrs: { name: 'VCALENDAR' },
        children: [{
          type: 'comp-filter',
          attrs: { name: 'VEVENT' },
          children: [{
            type: 'time-range',
            attrs: { start: '19980714T170000Z' }
          }]
        }]
      }],
      xhr: xhr
    })
    .then(function(account) {
      assert.lengthOf(account.calendars[0].objects, 0, 'out of range');
    });

    return Promise.all([inrange, outofrange]);
  });

  test('#syncCaldavAccount', function() {
    return dav.createAccount({
      server: 'http://127.0.0.1:8888/',
      xhr: xhr,
      accountType: 'caldav',
      loadCollections: false
    })
    .then(function(account) {
      assert.instanceOf(account, dav.Account);
      assert.notOk(account.calendars);
      return dav.syncCaldavAccount(account, { xhr: xhr });
    })
    .then(function(account) {
      assert.instanceOf(account, dav.Account);
      assert.isArray(account.calendars);
      assert.lengthOf(account.calendars, 1);
      var calendar = account.calendars[0];
      assert.instanceOf(calendar, dav.Calendar);
      assert.strictEqual(calendar.displayName, 'default calendar');
    });
  });
});
