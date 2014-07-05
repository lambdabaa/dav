/**
 * @class Model
 * @memberof model
 */
'use strict';

var stringify = require('json-stringify-safe');

/**
 * @constructor
 */
function Model(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Model;

/**
 * @return {Object} dehydrated, json representation of model.
 */
Model.prototype.jsonify = function() {
  return JSON.parse(stringify(this));
};
