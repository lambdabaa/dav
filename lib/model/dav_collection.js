'use strict';

var Model = require('./model'),
    util = require('util');

function DAVCollection() {
  Model.apply(this, arguments);
}
util.inherits(DAVCollection, Model);
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
