'use strict';

var XMLHttpRequest = require('./xmlhttprequest');

function Request(options) {
  for (var key in options) {
    this[key] = options[key];
  }
}
module.exports = Request;

Request.prototype = {
  /**
   * @type {String}
   */
  method: null,

  /**
   * @type {String}
   */
  url: null,

  /**
   * @type {String}
   */
  user: null,

  /**
   * @type {String}
   */
  password: null,

  /**
   * @type {String}
   */
  requestData: null,

  /**
   * @type {Object}
   */
  sandbox: null,

  /**
   * @type {Function}
   */
  authorize: null,

  /**
   * @type {Function}
   */
  transformRequest: null,

  /**
   * @type {Function}
   */
  transformResponse: null,

  /**
   * @type {Function}
   */
  onerror: null,

  /**
   * @type {XMLHttpRequest}
   */
  transport: null,

  /**
   * 1. Create the transport if it doesn't already exist.
   * 2. Apply optional, custom authorization to the request.
   * 3. Apply an optional, custom transformation to the request.
   * 4. Send the request.
   * 5. Apply an optional, custom transformation to the response.
   * 6. Resolve with the response.
   */
  send: function() {
    if (!this.transport) {
      this.transport = new XMLHttpRequest();
      if (this.sandbox) {
        this.transport.sandbox = this.sandbox;
      }
    }

    if (this.authorize) {
      this.authorize(this.transport);
    }

    this.transport.open(
      this.method,
      this.url,
      true /* async */,
      this.user,
      this.password
    );

    if (this.transformRequest) {
      this.transformRequest(this.transport);
    }

    return this.transport.send(this.requestData).then(function() {
      if (this.transformResponse) {
        var transformed = this.transformResponse(this.transport);
        return (typeof transformed !== 'undefined') ?
          transformed :
          this.transform;
      }

      return this.transport;
    }.bind(this))
    .catch(function(error) {
      if (this.onerror) {
        return this.onerror(error);
      }

      throw error;
    }.bind(this));
  }
};
