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
    format('<cal:%s name="%s" />', type, filter.name)
  );
}
exports.filterHelper = filterHelper;
Handlebars.registerHelper('filter', filterHelper);

function propHelper(prop) {
  var prop = prop.split(':');
  return new Handlebars.SafeString(
    format('<%s:%s />', prop[0], prop[1])
  );
}
exports.propHelper = propHelper;
Handlebars.registerHelper('prop', propHelper);
