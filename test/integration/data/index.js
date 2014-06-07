'use strict';
var camelize = require('../../../lib/camelize'),
    format = require('util').format,
    fs = require('fs');

[
  'bastille_day_party'
].forEach(function(filename) {
  var camelCase = camelize(filename);
  exports[camelCase] = fs.readFileSync(
    format('%s/%s.ics', __dirname, filename),
    'utf-8'
  );
});
