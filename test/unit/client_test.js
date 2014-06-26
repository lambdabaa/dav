'use strict';

var assert = require('chai').assert,
    dav = require('../../lib'),
    sinon = require('sinon');

suite('Client', function() {
  var client, xhr, send;

  setup(function() {
    xhr = new dav.transport.Basic(
      new dav.Credentials({
        username: 'Killer BOB',
        password: 'blacklodge'
      })
    );

    send = sinon.stub(xhr, 'send');
    client = new dav.Client(xhr, { baseUrl: 'https://mail.mozilla.com' });
  });

  teardown(function() {
    send.restore();
  });

  test('#send', function() {
    var req = dav.request.basic({
      method: 'PUT',
      data: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
      etag: 'abc123',
      url: 'https://mail.mozilla.com'
    });

    var sandbox = dav.createSandbox();
    client.send(req, { sandbox: sandbox });
    sinon.assert.calledWith(send, req, { sandbox: sandbox });
  });

  test('#send with relative url', function() {
    var req = dav.request.basic({
      method: 'PUT',
      data: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
      etag: 'abc123'
    });

    client.send(req, { url: '/calendars/123.ics' });
    assert.strictEqual(req.url, 'https://mail.mozilla.com/calendars/123.ics');
  });

  suite('accounts', function() {
    var createAccount;

    setup(function() {
      createAccount = sinon.stub(client._accounts, 'create');
    });

    teardown(function() {
      createAccount.restore();
    });

    test('createAccount', function() {
      client.createAccount({ sandbox: {}, server: 'http://dav.example.com' });
      sinon.assert.calledWith(createAccount, {
        sandbox: {},
        server: 'http://dav.example.com',
        xhr: xhr
      });
    });
  });

  suite('calendars', function() {
    var createCalendarObject,
        updateCalendarObject,
        deleteCalendarObject,
        syncCalendar;

    setup(function() {
      createCalendarObject = sinon.stub(
        client._calendars,
        'createCalendarObject'
      );
      updateCalendarObject = sinon.stub(
        client._calendars,
        'updateCalendarObject'
      );
      deleteCalendarObject = sinon.stub(
        client._calendars,
        'deleteCalendarObject'
      );
      syncCalendar = sinon.stub(client._calendars, 'sync');
    });

    teardown(function() {
      createCalendarObject.restore();
      updateCalendarObject.restore();
      deleteCalendarObject.restore();
      syncCalendar.restore();
    });

    test('#createCalendarObject', function() {
      var calendar = new dav.Calendar();
      client.createCalendarObject(calendar, {
        data: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
        filename: 'test.ics'
      });
      sinon.assert.calledWith(
        createCalendarObject,
        calendar,
        {
          data: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
          filename: 'test.ics',
          xhr: xhr
        }
      );
    });

    test('#updateCalendarObject', function() {
      var object = new dav.CalendarObject();
      client.updateCalendarObject(object);
      sinon.assert.calledWith(
        updateCalendarObject,
        object,
        {
          xhr: xhr
        }
      );
    });

    test('#deleteCalendarObject', function() {
      var object = new dav.CalendarObject();
      client.deleteCalendarObject(object);
      sinon.assert.calledWith(
        deleteCalendarObject,
        object,
        {
          xhr: xhr
        }
      );
    });

    test('#syncCalendar', function() {
      var calendar = new dav.Calendar();
      client.syncCalendar(calendar, {
        syncMethod: 'webdav'
      });
      sinon.assert.calledWith(
        syncCalendar,
        calendar,
        {
          syncMethod: 'webdav',
          xhr: xhr
        }
      );
    });
  });

  suite('contacts', function() {
    var createCard,
        updateCard,
        deleteCard,
        syncAddressBook;

    setup(function() {
      createCard = sinon.stub(client._contacts, 'createCard');
      updateCard = sinon.stub(client._contacts, 'updateCard');
      deleteCard = sinon.stub(client._contacts, 'deleteCard');
      syncAddressBook = sinon.stub(client._contacts, 'sync');
    });

    teardown(function() {
      createCard.restore();
      updateCard.restore();
      deleteCard.restore();
      syncAddressBook.restore();
    });

    test('#createCard', function() {
      var addressBook = new dav.AddressBook();
      client.createCard(addressBook, {
        data: 'BEGIN:VCARD\nEND:VCARD',
        filename: 'test.vcf'
      });
      sinon.assert.calledWith(
        createCard,
        addressBook,
        {
          data: 'BEGIN:VCARD\nEND:VCARD',
          filename: 'test.vcf',
          xhr: xhr
        }
      );
    });

    test('#updateCard', function() {
      var object = new dav.VCard();
      client.updateCard(object);
      sinon.assert.calledWith(
        updateCard,
        object,
        {
          xhr: xhr
        }
      );
    });

    test('#deleteCard', function() {
      var object = new dav.VCard();
      client.deleteCard(object);
      sinon.assert.calledWith(
        deleteCard,
        object,
        {
          xhr: xhr
        }
      );
    });

    test('#syncAddressBook', function() {
      var addressBook = new dav.AddressBook();
      client.syncAddressBook(addressBook, {
        syncMethod: 'basic'
      });
      sinon.assert.calledWith(
        syncAddressBook,
        addressBook,
        {
          syncMethod: 'basic',
          xhr: xhr
        }
      );
    });
  });
});
