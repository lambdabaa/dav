'use strict';

var XMLHttpRequest = require('./xmlhttprequest');

/**
 * Options:
 *   (String) url - endpoint to request.
 *   (String) data - put request body.
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 */
module.exports = function(options) {
  var put = new XMLHttpRequest();
  put.open(
    'PUT',
    options.url,
    true /* async */,
    options.username,
    options.password
  );

  return put.send(options.data).then(function() {
    if (put.status < 200 || put.status > 300) {
      throw new Error('Bad status: ' + put.status);
    }
  });
};
