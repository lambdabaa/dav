/**
 * @class DAVCollection
 * @memberof model
 * @property {Object} data - xml used to build the model.
 * @property {Array.<model.DAVObject>} objects - collection children.
 * @property {model.Account} account - account collection belongs to.
 * @property {String} ctag - collection tag for keeping cache.
 * @property {String} description - collection description.
 * @property {String} displayName - name for collection.
 * @property {Array.<String>} reports - list of supported report types.
 * @property {Array.<String>} resourcetype - name of resource kind.
 * @property {String} syncToken - token used for rfc 6578 webdav sync.
 * @property {String} url - collection url.
 */
'use strict';

var Model = require('./model'),
    util = require('util');

/**
 * @constructor
 */
function DAVCollection() {
  Model.apply(this, arguments);
}
util.inherits(DAVCollection, Model);
module.exports = DAVCollection;

DAVCollection.prototype.data = null;

DAVCollection.prototype.objects = null;

DAVCollection.prototype.account = null;

DAVCollection.prototype.ctag = null;

DAVCollection.prototype.description = null;

DAVCollection.prototype.displayName = null;

DAVCollection.prototype.reports = null;

DAVCollection.prototype.resourcetype = null;

DAVCollection.prototype.syncToken = null;

DAVCollection.prototype.url = null;
