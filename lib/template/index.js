'use strict';

var Handlebars = require('handlebars'),
    camelize = require('../camelize'),
    format = require('util').format,
    fs = require('fs');

require('./helpers');  // Augment Handlebars with our custom helpers.

[
  'calendar_query',
  'propfind'
].forEach(function(templateName) {
  var templateFile = format('%s/%s.hbs', __dirname, templateName);
  var template = fs.readFileSync(templateFile, 'utf-8');
  var camelCase = camelize(templateName);
  exports[camelCase] = Handlebars.compile(template);
});
