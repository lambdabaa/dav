/**
 * @fileoverview Private helpers for dav xhr requests.
 */
'use strict';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function extend(prop, other) {
  var result = clone(prop);
  for (var key in other) {
    if (!(key in result) || !result[key]) {
      result[key] = clone(other[key]);
      continue;
    }
  }

  return result;
}

function getProp(propstat) {
  if (/404/g.test(propstat.status)) {
    return null;
  }
  if (/5\d{2}/g.test(propstat.status) ||
      /4\d{2}/g.test(propstat.status)) {
    throw new Error('Bad status on propstat: ' + propstat.status);
  }

  if (!('prop' in propstat)) {
    throw new Error('propstat missing prop!');
  }

  return propstat.prop;
}

function mergeProps(props) {
  return props.reduce(function(a, b) {
    return extend(a, b);
  }, {});
}
exports.mergeProps = mergeProps;

/**
 * Map propstats to props.
 */
exports.getProps = function(propstats) {
  return mergeProps(
    propstats
      .map(getProp)
      .filter(function(prop) {
        return prop && typeof(prop) === 'object';
      })
    );
};

exports.setRequestHeaders = function(request, options) {
  request.setRequestHeader('Content-Type', 'application/xml;charset=utf-8');

  if ('depth' in options) {
    request.setRequestHeader('Depth', options.depth);
  }

  if ('etag' in options) {
    request.setRequestHeader('If-Match', options.etag);
  }
};
