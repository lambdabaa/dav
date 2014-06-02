var Handlebars = require('handlebars'),
    format = require('util').format,
    fs = require('fs');

/**
 * @private
 */
require('./helpers');  // Augment Handlebars with our custom helpers.

/**
 * @public
 */
[
  'calendarquery',
  'propfind'
].forEach(function(templateName) {
  var templateFile = format('%s/%s.hbs', __dirname, templateName);
  var template = fs.readFileSync(templateFile, 'utf-8');
  exports[templateName] = Handlebars.compile(template);
});
