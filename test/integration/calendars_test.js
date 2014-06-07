'use strict';

var Calendar = require('../../lib/model').Calendar,
    CalendarObject = require('../../lib/model').CalendarObject,
    assert = require('chai').assert,
    data = require('./data'),
    davinci = require('../../lib');

suite('calendars', function() {
  test('#createCalendarObject', function() {
    return davinci
      .createAccount({
        username: 'admin',
        password: 'admin',
        server: 'http://127.0.0.1:8888/'
      })
      .then(function(calendars) {
        var calendar = calendars[0];
        var objects = calendar.objects;
        assert.isArray(objects);
        assert.lengthOf(objects, 0);
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
      .then(function(calendars) {
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
  });
});
