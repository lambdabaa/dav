import * as ns from '../namespace';

let debug = require('debug')('dav:prop');

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
 *
 * (Array.<Object>) item - property item to request. Has to look like:
 *      { name: '<property name like getetag|address-data|...>', namespace: <namespace like ns.DAV|ns.CARDDAV|...> }
 *    it optionally might also contain an array of attributes like:
 *      { ... attrs: [{name: '<attribute name>', value: '<attribute value>'}, ...] }
 *    as well as it also might contain an array of childs like:
 *      { ... childs: [{ name: 'prop', attrs: [{name: 'name', value: 'FN'}], namespace: ns.CARDDAV }, ...]}
 */
export default function prop(item) {
  debug('item %o', item);
  
  var ret = `<${xmlnsPrefix(item.namespace)}:${item.name}`;
  if (item.attrs !== undefined) {
    ret += ` ${item.attrs.map(attr).join(' ')}`;
  }

  if (item.childs === undefined) {
    return ret + ' />';
  } else {
    ret += `>${item.childs.map(prop).join('')}`;
  }
  ret += `</${xmlnsPrefix(item.namespace)}:${item.name}>`;

  return ret;
}

function attr(item) {
  return `${item.name}="${item.value}"`;
}

function xmlnsPrefix(namespace) {
  switch (namespace) {
    case ns.DAV:
      return 'd';
    case ns.CALENDAR_SERVER:
      return 'cs';
    case ns.CALDAV_APPLE:
      return 'ca';
    case ns.CALDAV:
      return 'c';
    case ns.CARDDAV:
      return 'card';
    default:
      throw new Error('Unrecognized xmlns ' + namespace);
  }
}
