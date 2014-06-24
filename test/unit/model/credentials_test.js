'use strict';

var assert = require('chai').assert,
    dav = require('../../../lib');

suite('Credentials', function() {
  test('#jsonify', function() {
    var username = 'Killer BOB',
        password = 'blacklodge';

    var credentials = new dav.Credentials({
      username: username,
      password: password
    });

    assert.deepEqual(
      credentials.jsonify(),
      {
        username: username,
        password: password
      }
    );
  });
});
