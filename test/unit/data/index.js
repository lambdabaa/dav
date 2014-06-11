'use strict';

var camelize = require('../../../lib/camelize'),
    format = require('util').format,
    fs = require('fs');

[
  'current_user_principal',
  'calendar_query',
  'propfind'
].forEach(function(responseType) {
  var camelCase = camelize(responseType);
  exports[camelCase] = fs
    .readFileSync(
      format('%s/%s.xml', __dirname, responseType),
      'utf-8'
    )
    .replace(/>\s+</g, '><');  // Remove whitespace between close and open tag.
});
