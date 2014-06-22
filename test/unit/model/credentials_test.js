'use strict';

var assert = require('chai').assert,
    dav = require('../../../lib');

suite('Credentials', function() {
  test('#toString', function() {
    var username = 'Killer BOB',
        password = 'blacklodge';

    var credentials = new dav.Credentials({
      username: username,
      password: password
    });

    assert.deepEqual(
      JSON.parse(credentials.toString()),
      {
        username: username,
        password: password
      }
    );
  });
});
