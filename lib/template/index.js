var Handlebars = require('handlebars'),
    format = require('util').format,
    fs = require('fs');

[
  'propfind'
].forEach(function(templateName) {
  require(format('./%s_helper', templateName));
  var templateFile = format('%s/%s.hbs', __dirname, templateName);
  var template = fs.readFileSync(templateFile, 'utf-8');
  exports[templateName] = Handlebars.compile(template);
});
