var Handlebars = require('handlebars'),
    format = require('util').format;

function filterHelper(filter) {
  // TODO(gareth)
  return new Handlebars.SafeString('');
};
Handlebars.registerHelper('filter', exports.filterHelper = filterHelper);

function propHelper(prop, davNs) {
  var ns = prop.namespace === 'DAV' ? davNs : prop.namespace;
  return new Handlebars.SafeString(format('<%s:%s />', ns, prop.name));
};
Handlebars.registerHelper('prop', exports.propHelper = propHelper);
