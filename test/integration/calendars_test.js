'use strict';

var assert = require('chai').assert,
    data = require('./data'),
    davinci = require('../../lib'),
    debug = require('debug')('davinci:calendars_test');

suite('calendars', function() {
  var calendars;

  setup(function() {
    debug('Create account.');
    return davinci.createAccount({
      username: 'admin',
      password: 'admin',
      server: 'http://127.0.0.1:8888/'
    })
    .then(function(response) {
      var calendar = response.calendars[0];
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 0, 'initially 0 calendar objects');
      debug('Create calendar object');
      return davinci.createCalendarObject(calendar, {
        filename: 'test.ics',
        data: data.bastilleDayParty
      });
    })
    .then(function() {
      // TODO(gareth): Once we implement account sync,
      //     do that here.
      debug('Fetch account again.');
      return davinci.createAccount({
        username: 'admin',
        password: 'admin',
        server: 'http://127.0.0.1:8888/'
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
    assert.instanceOf(object, davinci.CalendarObject);
    assert.instanceOf(object.calendar, davinci.Calendar);
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

    return davinci.updateCalendarObject(object).then(function() {
      return davinci.syncCalendar(calendar, { syncMethod: 'basic' });
    })
    .then(function(calendar) {
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 1, 'update should not create new object');
      var object = objects[0];
      assert.instanceOf(object, davinci.CalendarObject);
      assert.instanceOf(object.calendar, davinci.Calendar);
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

    return davinci.updateCalendarObject(object).then(function() {
      return davinci.syncCalendar(calendar, { syncMethod: 'webdav' });
    })
    .then(function(calendar) {
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 1, 'update should not create new object');

      var object = objects[0];
      assert.instanceOf(object, davinci.CalendarObject);
      assert.instanceOf(object.calendar, davinci.Calendar);

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
    return davinci.deleteCalendarObject(object).then(function() {
      // TODO(gareth): Once we implement incremental/webdav sync,
      //     do that here.
      return davinci.createAccount({
        username: 'admin',
        password: 'admin',
        server: 'http://127.0.0.1:8888/'
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
    var inrange = davinci.createAccount({
      username: 'admin',
      password: 'admin',
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
      }]
    })
    .then(function(account) {
      assert.lengthOf(account.calendars[0].objects, 1, 'in range');
    });

    var outofrange = davinci.createAccount({
      username: 'admin',
      password: 'admin',
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
      }]
    })
    .then(function(account) {
      assert.lengthOf(account.calendars[0].objects, 0, 'out of range');
    });

    return Promise.all([inrange, outofrange]);
  });
});
