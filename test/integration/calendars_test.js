'use strict';

var Calendar = require('../../lib/model').Calendar,
    CalendarObject = require('../../lib/model').CalendarObject,
    assert = require('chai').assert,
    data = require('./data'),
    davinci = require('../../lib');

suite('calendars', function() {
  var calendars;

  setup(function() {
    return davinci.createAccount({
      username: 'admin',
      password: 'admin',
      server: 'http://127.0.0.1:8888/'
    })
    .then(function(calendars) {
      var calendar = calendars[0];
      var objects = calendar.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 0, 'initially 0 calendars');
      return davinci.createCalendarObject(calendar, {
        filename: 'test.ics',
        data: data.bastilleDayParty
      });
    })
    .then(function() {
      // TODO(gareth): Once we implement incremental/webdav sync,
      //     do that here.
      return davinci.createAccount({
        username: 'admin',
        password: 'admin',
        server: 'http://127.0.0.1:8888/'
      });
    })
    .then(function(response) {
      calendars = response;
    });
  });

  test('#createCalendarObject', function() {
    var calendar = calendars[0];
    var objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    var object = objects[0];
    assert.instanceOf(object, CalendarObject);
    assert.instanceOf(object.calendar, Calendar);
    assert.strictEqual(object.data, data.bastilleDayParty);
    assert.strictEqual(
      object.url,
      'http://127.0.0.1:8888/calendars/admin/default/test.ics'
    );
    assert.strictEqual(object.filename, 'test.ics');
  });

  test('#updateCalendarObject', function() {
    var calendar = calendars[0];
    var object = calendar.objects[0];
    object.data = object.data.replace(
      'SUMMARY:Bastille Day Party',
      'SUMMARY:Happy Hour'
    );
    return davinci
      .updateCalendarObject(object)
      .then(function() {
        // TODO(gareth): Once we implement incremental/webdav sync,
        //     do that here.
        return davinci.createAccount({
          username: 'admin',
          password: 'admin',
          server: 'http://127.0.0.1:8888/'
        });
      })
      .then(function(calendars) {
        var calendar = calendars[0];
        var objects = calendar.objects;
        assert.isArray(objects);
        assert.lengthOf(objects, 1, 'update should not create new object');
        var object = objects[0];
        assert.instanceOf(object, CalendarObject);
        assert.instanceOf(object.calendar, Calendar);
        assert.notStrictEqual(
          object.data,
          data.bastilleDayParty,
          'data should have changed on server'
        );
        assert.include(
          object.data,
          'SUMMARY:Happy Hour',
          'data should reflect update'
        );
        assert.notInclude(
          object.data,
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
    var calendar = calendars[0];
    var objects = calendar.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    var object = objects[0];
    return davinci
      .deleteCalendarObject(object)
      .then(function() {
        // TODO(gareth): Once we implement incremental/webdav sync,
        //     do that here.
        return davinci.createAccount({
          username: 'admin',
          password: 'admin',
          server: 'http://127.0.0.1:8888/'
        });
      })
      .then(function(calendars) {
        var calendar = calendars[0];
        var objects = calendar.objects;
        assert.isArray(objects);
        assert.lengthOf(objects, 0, 'should be deleted');
      });
  });
});
