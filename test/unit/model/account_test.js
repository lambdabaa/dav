'use strict';

var assert = require('chai').assert,
    dav = require('../../../lib');

suite('Account', function() {
  test('jsonify', function() {
    var server = 'http://dav.example.com',
        credentials = new dav.Credentials({
          username: 'Killer BOB',
          password: 'blacklodge'
        }),
        rootUrl = 'http://dav.example.com/caldav';

    var account = new dav.Account({
      server: server,
      credentials: credentials,
      rootUrl: rootUrl
    });

    var calendars = [new dav.Calendar({ account: account })];
    account.calendars = calendars;

    var json = dav.jsonify(account);
    assert.strictEqual(json.server, server);
    assert.deepEqual(json.credentials, {
      username: 'Killer BOB',
      password: 'blacklodge'
    });
    assert.strictEqual(json.rootUrl, rootUrl);
    assert.deepEqual(json.calendars, [{
      account: '[Circular ~]'
    }]);
  });
});
