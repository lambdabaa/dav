import * as ns from '../namespace';

let debug = require('debug')('dav:prop');

/**
 * (Array.<Object>) item - property to request. Has to look like:
 *  {
 *    name: '<property name like getetag|address-data|prop|...>',
 *    namespace: <namespace like ns.DAV|ns.CARDDAV|...>,
 *    attrs: {<attribute name>: '<attribute value>', ...},           (optional)
 *    value: <property value or array of further property childs>,    (optional)
 *  }
 */
export default function prop(item) {
  debug('item %o', item);

  if (item.value === undefined) {
    return `<${xmlnsPrefix(item.namespace)}:${item.name}${formatAttrs(item.attrs)} />`;
  }

  if (typeof item.value !== 'object') {
    return `<${xmlnsPrefix(item.namespace)}:${item.name}${formatAttrs(item.attrs)}>${item.value}</${xmlnsPrefix(item.namespace)}:${item.name}>`;
  }

  return `<${xmlnsPrefix(item.namespace)}:${item.name}${formatAttrs(item.attrs)}>${item.value.map(prop).join('')}</${xmlnsPrefix(item.namespace)}:${item.name}>`;
}

function formatAttrs(attrs) {
  if (typeof attrs !== 'object') {
    return '';
  }

  return ' ' + Object.keys(attrs)
    .map(attr => `${attr}="${attrs[attr]}"`)
    .join(' ');
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
