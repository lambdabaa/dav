'use strict';

var Handlebars = require('handlebars'),
    format = require('util').format;

function filterHelper(filter) {
  var type;
  switch (filter.type) {
    case 'comp':
      type = 'comp-filter';
      break;
    default:
      throw new Error('filter type ' + filter.type + ' not recognized');
  }

  return new Handlebars.SafeString(
    format('<%s:%s name="%s" />', filter.namespace, type, filter.name)
  );
}
exports.filterHelper = filterHelper;
Handlebars.registerHelper('filter', filterHelper);

function propHelper(prop) {
  return new Handlebars.SafeString(
    format('<%s:%s />', prop.namespace, prop.name)
  );
}
exports.propHelper = propHelper;
Handlebars.registerHelper('prop', propHelper);
