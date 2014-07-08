'use strict';

var stringify = require('json-stringify-safe');

module.exports = function(obj) {
  return JSON.parse(stringify(obj));
};
