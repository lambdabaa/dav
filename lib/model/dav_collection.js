'use strict';

function DAVCollection(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = DAVCollection;

/**
 * @type {Object}
 */
DAVCollection.prototype.data = null;

/**
 * @type {Array.<DAVObject>}
 */
DAVCollection.prototype.objects = null;

/**
 * @type {dav.Account}
 */
DAVCollection.prototype.account = null;

/**
 * @type {String}
 */
DAVCollection.prototype.ctag = null;

/**
 * @type {String}
 */
DAVCollection.prototype.description = null;

/**
 * @type {String}
 */
DAVCollection.prototype.displayName = null;

/**
 * @type {Array.<String>}
 */
DAVCollection.prototype.reports = null;

/**
 * @type {Array.<String>}
 */
DAVCollection.prototype.resourcetype = null;

/**
 * @type {String}
 */
DAVCollection.prototype.syncToken = null;

/**
 * @type {String}
 */
DAVCollection.prototype.url = null;
