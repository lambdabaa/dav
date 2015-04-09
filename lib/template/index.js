let fs = require('fs');
import Handlebars from 'handlebars';
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
export function filterHelper(filter) {
  if (!filter.children || !filter.children.length) {
    return new Handlebars.SafeString(
      format('<c:%s %s/>', filter.type, formatAttrs(filter.attrs))
    );
  }

  var children = filter.children
    .map(filterHelper)
    .map(safeString => safeString.string);

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
Handlebars.registerHelper('filter', filterHelper);

export function propHelper(prop) {
  return new Handlebars.SafeString(
    format('<%s:%s />', xmlnsPrefix(prop.namespace), prop.name)
  );
}
Handlebars.registerHelper('prop', propHelper);

export let addressBookQuery = Handlebars.compile(
  fs.readFileSync(__dirname + '/address_book_query.hbs', 'utf-8')
);

export let calendarQuery = Handlebars.compile(
  fs.readFileSync(__dirname + '/calendar_query.hbs', 'utf-8')
);

export let propfind = Handlebars.compile(
  fs.readFileSync(__dirname + '/propfind.hbs', 'utf-8')
);

export let syncCollection = Handlebars.compile(
  fs.readFileSync(__dirname + '/sync_collection.hbs', 'utf-8')
);

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
