'use strict';

var Model = require('./model'),
    util = require('util');

function DAVObject() {
  Model.apply(this, arguments);
}
util.inherits(DAVObject, Model);
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
