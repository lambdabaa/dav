'use strict';

var Handlebars = require('handlebars'),
    format = require('util').format,
    ns = require('../namespace');

function formatAttrs(attrs) {
  if (typeof attrs !== 'object') {
    return '';
  }

  return Object.keys(attrs)
    .map(function(attr) {
      return format('%s="%s"', attr, attrs[attr]);
    })
    .join(' ');
}

function xmlnsPrefix(namespace) {
  switch (namespace) {
    case ns.DAV:
      return 'd';
    case ns.CALENDAR_SERVER:
      return 'cs';
    case ns.CALDAV:
      return 'c';
    case ns.CARDDAV:
      return 'card';
    default:
      throw new Error('Unrecognized xmlns ' + namespace);
  }
}

/**
 * @param {Object} filter looks like
 *
 *     {
 *       type: 'comp-filter',
 *       attrs: {
 *         name: 'VCALENDAR'
 *       }
 *     }
 *
 * Or maybe
 *
 *     {
 *       type: 'time-range',
 *       attrs: {
 *         start: '20060104T000000Z',
 *         end: '20060105T000000Z'
 *       }
 *     }
 *
 * You can nest them like so:
 *
 *     {
 *       type: 'comp-filter',
 *       attrs: { name: 'VCALENDAR' },
 *       children: [{
 *         type: 'comp-filter',
 *         attrs: { name: 'VEVENT' },
 *         children: [{
 *           type: 'time-range',
 *           attrs: { start: '20060104T000000Z', end: '20060105T000000Z' }
 *         }]
 *       }]
 *     }
 */
function filterHelper(filter) {
  if (!filter.children || !filter.children.length) {
    return new Handlebars.SafeString(
      format('<c:%s %s/>', filter.type, formatAttrs(filter.attrs))
    );
  }

  var children = filter.children
    .map(filterHelper)
    .map(function(safeString) {
      return safeString.string;
    });

  return new Handlebars.SafeString(
    format(
      '<c:%s %s>%s</c:%s>',
      filter.type,
      formatAttrs(filter.attrs),
      children,
      filter.type
    )
  );
}
exports.filterHelper = filterHelper;
Handlebars.registerHelper('filter', filterHelper);

function propHelper(prop) {
  return new Handlebars.SafeString(
    format('<%s:%s />', xmlnsPrefix(prop.namespace), prop.name)
  );
}
exports.propHelper = propHelper;
Handlebars.registerHelper('prop', propHelper);
