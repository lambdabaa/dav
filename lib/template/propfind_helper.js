var Handlebars = require('handlebars'),
    format = require('util').format;

Handlebars.registerHelper('prop', function(prop, davNs) {
  var ns = prop.namespace === 'DAV' ? davNs : prop.namespace;
  return new Handlebars.SafeString(format('<%s:%s />', ns, prop.name));
});
