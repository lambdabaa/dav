'use strict';

var assert = require('chai').assert,
    data = require('./data'),
    dav = require('../../lib/index');

suite('Client', function() {
  var client, account;

  setup(function() {
    client = new dav.Client(
      new dav.transport.Basic(
        new dav.Credentials({
          username: 'admin',
          password: 'admin'
        })
      )
    );

    return client.createAccount({
      server: 'http://127.0.0.1:8888/'
    })
    .then(function(response) {
      account = response;
    });
  });

  test('#createAccount', function() {
    assert.instanceOf(account, dav.Account);
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
  });

  suite('calendar object', function() {
    var calendar;

    setup(function() {
      return client.createCalendarObject(account.calendars[0], {
        filename: 'test.ics',
        data: data.bastilleDayParty
      })
      .then(function() {
        return client.syncCalendar(account.calendars[0]);
      })
      .then(function(response) {
        calendar = response;
      });
    });

    test('#createCalendarObject', function() {
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
      var object = calendar.objects[0];
      object.calendarData = object.calendarData.replace(
        'SUMMARY:Bastille Day Party',
        'SUMMARY:Happy Hour'
      );

      return client.updateCalendarObject(object).then(function() {
        return client.syncCalendar(calendar);
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

    test('#deleteCalendarObject', function() {
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 1);
      var object = objects[0];
      return client.deleteCalendarObject(object).then(function() {
        // TODO(gareth): Once we implement incremental/webdav sync,
        //     do that here.
        return client.createAccount({ server: 'http://127.0.0.1:8888/' });
      })
      .then(function(response) {
        var calendars = response.calendars;
        var calendar = calendars[0];
        var objects = calendar.objects;
        assert.isArray(objects);
        assert.lengthOf(objects, 0, 'should be deleted');
      });
    });
  });
});
