'use strict';
var camelize = require('../../../lib/camelize'),
    format = require('util').format,
    fs = require('fs');

[
  { name: 'bastille_day_party', fmt: 'ics' },
  { name: 'forrest_gump', fmt: 'vcf' }
].forEach(function(file) {
  var camelCase = camelize(file.name);
  exports[camelCase] = fs.readFileSync(
    format('%s/%s.%s', __dirname, file.name, file.fmt),
    'utf-8'
  );
});
