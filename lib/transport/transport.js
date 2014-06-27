/**
 * @fileoverview transport 'interface'.
 */
'use strict';

/**
 * @param {dav.Credentials} credentials user authorization.
 */
function Transport(credentials) {
  this.credentials = credentials;
}
module.exports = Transport;

/**
 * @type {dav.Credentials}
 */
Transport.prototype.credentials = null;

/**
 * @param {dav.Request} request object with request info.
 * @return {Promise} a promise that will be resolved with an xhr request after
 *     its readyState is 4 or the result of applying an optional request
 *     `transformResponse` function to the xhr object after its readyState is 4.
 *
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 */
Transport.prototype.send = function() {};
