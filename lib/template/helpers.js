'use strict';
var Handlebars = require('handlebars'),
    format = require('util').format;

function filterHelper() {
  // TODO(gareth)
  return new Handlebars.SafeString('');
}
exports.filterHelper = filterHelper;
Handlebars.registerHelper('filter', filterHelper);

function propHelper(prop, davNs) {
  var ns = prop.namespace === 'DAV' ? davNs : prop.namespace;
  return new Handlebars.SafeString(format('<%s:%s />', ns, prop.name));
}
exports.propHelper = propHelper;
Handlebars.registerHelper('prop', propHelper);
