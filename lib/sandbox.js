/**
 * @fileoverview Group requests together and then abort as a group.
 *
 * var sandbox = new dav.Sandbox();
 * return Promise.all([
 *   dav.createEvent(event, { sandbox: sandbox }),
 *   dav.deleteEvent(other, { sandbox: sandbox })
 * ])
 * .catch(function() {
 *   // Something went wrong so abort all requests.
 *   sandbox.abort;
 * });
 */
'use strict';

var debug = require('debug')('dav:sandbox');

function Sandbox() {
  this.requestList = [];
}
module.exports = Sandbox;

Sandbox.prototype = {
  /**
   * @type {Array.<XMLHttpRequest>}
   */
  requestList: null,

  add: function(request) {
    debug('Adding request to sandbox.');
    this.requestList.push(request);
  },

  abort: function() {
    debug('Aborting sandboxed requests.');
    this.requestList.forEach(function(request) {
      request.abort();
    });
  }
};
