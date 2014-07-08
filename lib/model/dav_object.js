'use strict';

function DAVObject(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = DAVObject;

/**
 * @type {Object}
 */
DAVObject.prototype.data = null;

/**
 * @type {String}
 */
DAVObject.prototype.etag = null;

/**
 * @type {String}
 */
DAVObject.prototype.url = null;
