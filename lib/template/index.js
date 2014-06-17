'use strict';

var Handlebars = require('handlebars'),
    camelize = require('../camelize'),
    format = require('util').format;

// Needs to be on another line since github.com/substack/brfs/issues/28.
var fs = require('fs');

require('./helpers');  // Augment Handlebars with our custom helpers.

[
  'calendar_query',
  'propfind',
  'sync_collection'
].forEach(function(templateName) {
  var templateFile = format('%s/%s.hbs', __dirname, templateName);
  var template = fs.readFileSync(templateFile, 'utf-8');
  var camelCase = camelize(templateName);
  exports[camelCase] = Handlebars.compile(template);
});
