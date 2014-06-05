/**
 * @fileoverview Group requests together and then abort as a group.
 *
 * var sandbox = davinci.sandbox();
 * return davinci
 *   .then(function() {
 *     return Promise.all([
 *       davinci.createEvent(event, { sandbox: sandbox }),
 *       davinci.deleteEvent(other, { sandbox: sandbox })
 *     ]);
 *   })
 *   .catch(function() {
 *     sandbox.abort();  // abort all requests made in the sandbox.
 *   });
 */
'use strict';

var debug = require('debug')('davinci:sandbox');

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
