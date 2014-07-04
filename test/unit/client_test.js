'use strict';

var dav = require('../../lib'),
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
    var url = 'https://mail.mozilla.com/';
    var req = dav.request.basic({
      method: 'PUT',
      data: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
      etag: 'abc123'
    });

    var sandbox = dav.createSandbox();
    client.send(req, url, { sandbox: sandbox });
    sinon.assert.calledWith(send, req, url, { sandbox: sandbox });
  });

  test('#send with relative url', function() {
    var req = dav.request.basic({
      method: 'PUT',
      data: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
      etag: 'abc123'
    });

    client.send(req, '/calendars/123.ics');
    sinon.assert.calledWith(
      send,
      req,
      'https://mail.mozilla.com/calendars/123.ics'
    );
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
        syncCalendar,
        syncCaldavAccount;

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
      syncCaldavAccount = sinon.stub(client._calendars, 'syncAccount');
    });

    teardown(function() {
      createCalendarObject.restore();
      updateCalendarObject.restore();
      deleteCalendarObject.restore();
      syncCalendar.restore();
      syncCaldavAccount.restore();
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
      client.syncCalendar(calendar, { syncMethod: 'webdav' });
      sinon.assert.calledWith(
        syncCalendar,
        calendar,
        {
          syncMethod: 'webdav',
          xhr: xhr
        }
      );
    });

    test('#syncCaldavAccount', function() {
      var account = new dav.Account();
      client.syncCaldavAccount(account, { syncMethod: 'webdav' });
      sinon.assert.calledWith(
        syncCaldavAccount,
        account,
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
        syncAddressBook,
        syncCarddavAccount;

    setup(function() {
      createCard = sinon.stub(client._contacts, 'createCard');
      updateCard = sinon.stub(client._contacts, 'updateCard');
      deleteCard = sinon.stub(client._contacts, 'deleteCard');
      syncAddressBook = sinon.stub(client._contacts, 'sync');
      syncCarddavAccount = sinon.stub(client._contacts, 'syncAccount');
    });

    teardown(function() {
      createCard.restore();
      updateCard.restore();
      deleteCard.restore();
      syncAddressBook.restore();
      syncCarddavAccount.restore();
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

    test('#syncCarddavAccount', function() {
      var account = new dav.Account();
      client.syncCarddavAccount(account, { syncMethod: 'basic' });
      sinon.assert.calledWith(
        syncCarddavAccount,
        account,
        {
          syncMethod: 'basic',
          xhr: xhr
        }
      );
    });
  });
});
