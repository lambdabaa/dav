import { assert } from 'chai';
import data from './data';
import * as dav from '../../lib';

let debug = require('debug')('dav:calendars_test');

suite('calendars', function() {
  let calendars, xhr;

  setup(async function() {
    debug('Create account.');
    xhr = new dav.transport.Basic(
      new dav.Credentials({
        username: 'admin',
        password: 'admin'
      })
    );

    let account = await dav.createAccount({
      server: 'http://127.0.0.1:8888/',
      xhr: xhr
    });

    let calendar = account.calendars[0];
    let objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 0, 'initially 0 calendar objects');
    debug('Create calendar object.');
    await dav.createCalendarObject(calendar, {
      filename: 'test.ics',
      data: data.bastilleDayParty,
      xhr: xhr
    });

    let synced = await dav.syncCaldavAccount(account, { xhr: xhr });
    calendars = synced.calendars;
  });

  test('#createCalendarObject', function() {
    let calendar = calendars[0];
    let objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    let object = objects[0];
    assert.instanceOf(object, dav.CalendarObject);
    assert.instanceOf(object.calendar, dav.Calendar);
    assert.strictEqual(object.calendarData, data.bastilleDayParty);
    assert.strictEqual(
      object.url,
      'http://127.0.0.1:8888/calendars/admin/default/test.ics'
    );
  });

  test('#updateCalendarObject, #sync', async function() {
    let calendar = calendars[0];
    let object = calendar.objects[0];
    object.calendarData = object.calendarData.replace(
      'SUMMARY:Bastille Day Party',
      'SUMMARY:Happy Hour'
    );

    await dav.updateCalendarObject(object, { xhr: xhr });
    calendar = await dav.syncCalendar(calendar, {
      syncMethod: 'basic',
      xhr: xhr
    });

    let objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1, 'update should not create new object');
    object = objects[0];
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

  test('webdav sync', async function() {
    let calendar = calendars[0];
    let object = calendar.objects[0];
    object.calendarData = object.calendarData.replace(
      'SUMMARY:Bastille Day Party',
      'SUMMARY:Happy Hour'
    );

    let prevEtag = object.etag;
    assert.typeOf(prevEtag, 'string');
    assert.operator(prevEtag.length, '>', 0);

    let prevSyncToken = calendar.syncToken;
    assert.typeOf(prevSyncToken, 'string');
    assert.operator(prevSyncToken.length, '>', 0);

    await dav.updateCalendarObject(object, { xhr: xhr });
    calendar = await dav.syncCalendar(calendar, {
      syncMethod: 'webdav',
      xhr: xhr
    });

    let objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1, 'update should not create new object');

    object = objects[0];
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

  test('#deleteCalendarObject', async function() {
    let calendar = calendars[0];
    let objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    let object = objects[0];
    await dav.deleteCalendarObject(object, { xhr: xhr });
    let updated = await dav.syncCalendar(calendar, {
      syncMethod: 'basic',
      xhr: xhr
    });

    objects = updated.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 0, 'should be deleted');
  });

  test('time-range filtering', async function() {
    let account1 = await dav.createAccount({
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
    });

    assert.lengthOf(account1.calendars[0].objects, 1, 'in range');

    let account2 = await dav.createAccount({
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
    });

    assert.lengthOf(account2.calendars[0].objects, 0, 'out of range');
  });

  test('#syncCaldavAccount', async function() {
    let account = await dav.createAccount({
      server: 'http://127.0.0.1:8888/',
      xhr: xhr,
      accountType: 'caldav',
      loadCollections: false
    });
    assert.instanceOf(account, dav.Account);
    assert.notOk(account.calendars);

    account = await dav.syncCaldavAccount(account, { xhr: xhr });
    assert.instanceOf(account, dav.Account);
    assert.isArray(account.calendars);
    assert.lengthOf(account.calendars, 1);
    let calendar = account.calendars[0];
    assert.instanceOf(calendar, dav.Calendar);
    assert.strictEqual(calendar.displayName, 'default calendar');
  });
});
