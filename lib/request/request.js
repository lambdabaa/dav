'use strict';

var Client = require('../client');

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
  body: null,

  /**
   * Request headers
   */
  headers : {},

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

  getUrl : function() {

    return this.url;

  },

  getMethod : function() {

    return this.method;

  },

  getBody : function() {

    return this.body;

  },

  getHeaders : function() {

    return this.headers;

  },

  /**
   * This is a helper method that can used for a request
   * to send itself.
   *
   * This method will be deprecated, but kept around for now, to aid with
   * refactoring.
   */
  send: function() {

    if (!this.client) {
        this.client = new Client();
    }
    this.client.send(this);

  /*
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
      true, // async
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
  */
  }


};
