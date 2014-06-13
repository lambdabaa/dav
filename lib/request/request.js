'use strict';

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
  requestData: null,

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
  onerror: null
};
