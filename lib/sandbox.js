/**
 * @fileoverview Group requests together and then abort as a group.
 *
 * var sandbox = dav.sandbox();
 * return dav
 *   .then(function() {
 *     return Promise.all([
 *       dav.createEvent(event, { sandbox: sandbox }),
 *       dav.deleteEvent(other, { sandbox: sandbox })
 *     ]);
 *   })
 *   .catch(function() {
 *     sandbox.abort();  // abort all requests made in the sandbox.
 *   });
 */
'use strict';

var debug = require('debug')('dav:sandbox');

module.exports = function() {
  var requestList = [];
  return {
    get requestList() {
      return requestList;
    },

    add: function(request) {
      debug('Adding request to sandbox.');
      requestList.push(request);
    },
    abort: function() {
      debug('Aborting sandboxed requests.');
      requestList.forEach(function(request) {
        request.abort();
      });
    }
  };
};
