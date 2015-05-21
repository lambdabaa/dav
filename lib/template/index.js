import runtime from 'hbsfy/runtime';
import { format } from 'util';

import * as ns from '../namespace';

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
    return new runtime.SafeString(
      format('<c:%s %s/>', filter.type, formatAttrs(filter.attrs))
    );
  }

  var children = filter.children
    .map(filterHelper)
    .map(safeString => safeString.string);

  return new runtime.SafeString(
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

function propHelper(prop) {
  return new runtime.SafeString(
    format('<%s:%s />', xmlnsPrefix(prop.namespace), prop.name)
  );
}
exports.propHelper = propHelper;

function formatAttrs(attrs) {
  if (typeof attrs !== 'object') {
    return '';
  }

  return Object.keys(attrs)
    .map(attr => format('%s="%s"', attr, attrs[attr]))
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

runtime.registerHelper('filter', filterHelper);
runtime.registerHelper('prop', propHelper);

try {
  exports.addressBookQuery = require('./address_book_query.hbs');
  exports.calendarQuery = require('./calendar_query.hbs');
  exports.propfind = require('./propfind.hbs');
  exports.syncCollection = require('./sync_collection.hbs');
} catch (error) {
  // Absurd hacks to make unit tests work.
  let Handlebars = require('handlebars');
  let camelize = require('../camelize');
  let fs = require('fs');

  Handlebars.registerHelper('filter', filterHelper);
  Handlebars.registerHelper('prop', propHelper);

  [
    'address_book_query',
    'calendar_query',
    'propfind',
    'sync_collection'
  ].forEach(templateName => {
    exports[camelize(templateName)] = Handlebars.compile(
      fs.readFileSync(`${__dirname}/${templateName}.hbs`, 'utf-8')
    );
  });
}
