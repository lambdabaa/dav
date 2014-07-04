'use strict';

var assert = require('chai').assert,
    data = require('./data'),
    dav = require('../../lib'),
    debug = require('debug')('dav:contacts_test');

suite('contacts', function() {
  var addressBooks, xhr;

  setup(function() {
    debug('Create account.');

    xhr = new dav.transport.Basic(
      new dav.Credentials({
        username: 'admin',
        password: 'admin'
      })
    );

    return dav.createAccount({
      server: 'http://127.0.0.1:8888/',
      xhr: xhr,
      accountType: 'carddav'
    })
    .then(function(response) {
      var addressBook = response.addressBooks[1];
      var objects = addressBook.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 0, 'initially 0 address books');
      debug('Create vcard.');
      return dav.createCard(addressBook, {
        filename: 'test.vcf',
        data: data.forrestGump,
        xhr: xhr
      });
    })
    .then(function() {
      // TODO(gareth): Once we implement account sync,
      //     do that here.
      debug('Fetch account again.');
      return dav.createAccount({
        server: 'http://127.0.0.1:8888/',
        xhr: xhr,
        accountType: 'carddav'
      });
    })
    .then(function(response) {
      addressBooks = response.addressBooks;
    });
  });

  test('#createCard', function() {
    var addressBook = addressBooks[1];
    var objects = addressBook.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    var object = objects[0];
    assert.instanceOf(object, dav.VCard);
    assert.instanceOf(object.addressBook, dav.AddressBook);
    assert.strictEqual(
      object.addressData
        .replace(/UID\:[^\n]+\n/, '')
        .replace(/;/g, '')
        .replace(/\s+/g, ''),
      data.forrestGump
        .replace(/;/g, '')
        .replace(/\s+/g, '')
    );
    assert.strictEqual(
      object.url,
      'http://127.0.0.1:8888/addressbooks/admin/default/test.vcf'
    );
  });

  test('#updateCard, #sync', function() {
    var addressBook = addressBooks[1];
    var object = addressBook.objects[0];
    object.addressData = object.addressData.replace(
      'forrestgump@example.com',
      'lieutenantdan@example.com'
    );

    return dav.updateCard(object, { xhr: xhr })
    .then(function() {
      return dav.syncAddressBook(addressBook, {
        syncMethod: 'basic',
        xhr: xhr
      });
    })
    .then(function(addressBook) {
      var objects = addressBook.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 1, 'update should not create new object');
      var object = objects[0];
      assert.instanceOf(object, dav.VCard);
      assert.instanceOf(object.addressBook, dav.AddressBook);
      assert.notStrictEqual(
        object.addressData
          .replace(/UID\:[^\n]+\n/, '')
          .replace(/;/g, '')
          .replace(/\s+/g, ''),
        data.forrestGump
          .replace(/;/g, '')
          .replace(/\s+/g, ''),
        'data should have changed on server'
      );
      assert.include(
        object.addressData,
        'lieutenantdan@example.com',
        'data should reflect update'
      );
      assert.notInclude(
        object.addressData,
        'forrestgump@example.com',
        'data should reflect update'
      );
      assert.strictEqual(
        object.url,
        'http://127.0.0.1:8888/addressbooks/admin/default/test.vcf',
        'update should not change object url'
      );
    });
  });

  test('webdav sync', function() {
    var addressBook = addressBooks[1];
    var object = addressBook.objects[0];
    object.addressData = object.addressData.replace(
      'forrestgump@example.com',
      'lieutenantdan@example.com'
    );

    var prevEtag = object.etag;
    assert.typeOf(prevEtag, 'string');
    assert.operator(prevEtag.length, '>', 0);

    var prevSyncToken = addressBook.syncToken;
    assert.typeOf(prevSyncToken, 'string');
    assert.operator(prevSyncToken.length, '>', 0);

    return dav.updateCard(object, { xhr: xhr })
    .then(function() {
      return dav.syncAddressBook(addressBook, {
        syncMethod: 'webdav',
        xhr: xhr
      });
    })
    .then(function(addressBook) {
      var objects = addressBook.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 1, 'update should not create new object');

      var object = objects[0];
      assert.instanceOf(object, dav.VCard);
      assert.instanceOf(object.addressBook, dav.AddressBook);

      assert.notStrictEqual(
        object.addressData
          .replace(/UID\:[^\n]+\n/, '')
          .replace(/;/g, '')
          .replace(/\s+/g, ''),
        data.forrestGump
          .replace(/;/g, '')
          .replace(/\s+/g, ''),
        'data should have changed on server'
      );
      assert.include(
        object.addressData,
        'lieutenantdan@example.com',
        'data should reflect update'
      );
      assert.notInclude(
        object.addressData,
        'forrestgump@example.com',
        'data should reflect update'
      );
      assert.notStrictEqual(
        object.addressData,
        data.bastilleDayParty,
        'data should have changed on server'
      );

      assert.typeOf(object.etag, 'string');
      assert.operator(object.etag.length, '>', 0);
      assert.notStrictEqual(prevEtag, object.etag, 'new etag');

      assert.typeOf(addressBook.syncToken, 'string');
      assert.operator(addressBook.syncToken.length, '>', 0);
      assert.notStrictEqual(addressBook.syncToken, prevSyncToken, 'new token');
    });
  });

  test('#deleteCard', function() {
    var addressBook = addressBooks[1];
    var objects = addressBook.objects;
    assert.isArray(objects);
    assert.lengthOf(objects, 1);
    var object = objects[0];
    return dav.deleteCard(object, { xhr: xhr })
    .then(function() {
      // TODO(gareth): Once we implement incremental/webdav sync,
      //     do that here.
      return dav.createAccount({
        server: 'http://127.0.0.1:8888/',
        xhr: xhr,
        accountType: 'carddav'
      });
    })
    .then(function(response) {
      var addressBooks = response.addressBooks;
      var addressBook = addressBooks[0];
      var objects = addressBook.objects;
      assert.isArray(objects);
      assert.lengthOf(objects, 0, 'should be deleted');
    });
  });

  test('#syncCarddavAccount', function() {
    return dav.createAccount({
      server: 'http://127.0.0.1:8888/',
      xhr: xhr,
      accountType: 'carddav',
      loadCollections: false
    })
    .then(function(account) {
      assert.instanceOf(account, dav.Account);
      assert.notOk(account.addressBooks);
      return dav.syncCarddavAccount(account, { xhr: xhr });
    })
    .then(function(account) {
      assert.instanceOf(account, dav.Account);
      assert.isArray(account.addressBooks);
      assert.ok(
        account.addressBooks.some(function(addressBook) {
          return addressBook instanceof dav.AddressBook &&
                 addressBook.displayName === 'default address book';
        })
      );
    });
  });
});
