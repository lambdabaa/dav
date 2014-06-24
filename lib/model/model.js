'use strict';

var stringify = require('json-stringify-safe');

function Model(options) {
  if (typeof options === 'object') {
    for (var key in options) {
      this[key] = options[key];
    }
  }
}
module.exports = Model;

Model.prototype.jsonify = function() {
  return JSON.parse(stringify(this));
};
