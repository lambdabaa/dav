'use strict';

var assert = require('chai').assert,
    dav = require('../../../lib');

suite('VCard', function() {
  test('jsonify', function() {
    var server = 'http://dav.example.com',
        credentials = new dav.Credentials({
          username: 'Killer BOB',
          password: 'blacklodge'
        }),
        rootUrl = 'http://dav.example.com/carddav',
        ctag = 'abc123',
        displayName = 'default',
        reports = ['addressbook-query'],
        addressBookUrl = 'http://dav.example.com/caldav/Killer BOB/coworkers',
        description = 'Killer BOB coworkers',
        syncToken = 'http://dav.example.com/carddav/sync/0',
        etag = 'cache me if you can',
        addressData = 'BEGIN:VCALENDAR\nEND:VCALENDAR',
        url = 'http://dav.example.com/caldav/Killer Bob/coworkers.vcf';

    var account = new dav.Account({
      server: server,
      credentials: credentials,
      rootUrl: rootUrl
    });

    var addressBook = new dav.AddressBook({
      account: account,
      ctag: ctag,
      displayName: displayName,
      reports: reports,
      url: addressBookUrl,
      description: description,
      syncToken: syncToken
    });

    account.addressBooks = [addressBook];

    var vcard = new dav.VCard({
      addressBook: addressBook,
      etag: etag,
      addressData: addressData,
      url: url
    });

    addressBook.objects = [vcard];

    var json = dav.jsonify(vcard);
    assert.strictEqual(json.addressBook.account.server, server);
    assert.deepEqual(json.addressBook.account.credentials, {
      username: 'Killer BOB',
      password: 'blacklodge'
    });
    assert.strictEqual(json.addressBook.account.rootUrl, rootUrl);
    assert.deepEqual(
      json.addressBook.account.addressBooks,
      ['[Circular ~.addressBook]']
    );
    assert.strictEqual(json.addressBook.ctag, addressBook.ctag);
    assert.strictEqual(json.addressBook.displayName, addressBook.displayName);
    assert.deepEqual(json.addressBook.reports, addressBook.reports);
    assert.strictEqual(json.addressBook.url, addressBookUrl);
    assert.strictEqual(json.addressBook.description, description);
    assert.strictEqual(json.addressBook.syncToken, syncToken);
    assert.strictEqual(json.etag, etag);
    assert.strictEqual(json.addressData, addressData);
    assert.strictEqual(json.url, url);
  });
});
