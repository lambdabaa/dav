'use strict';

var _ = require('underscore'),
    DOMParser = require('./domparser'),
    debug = require('debug')('davinci:parser:multistatus');

function childNodes(node) {
  var result = node.childNodes;
  if (!Array.isArray(result)) {
    result = Array.prototype.slice.call(result);
  }

  return result;
}

function child(node, localName) {
  return _.find(childNodes(node), function(childNode) {
    return childNode.localName === localName;
  });
}

function children(node, localName) {
  return childNodes(node).filter(function(childNode) {
    return childNode.localName === localName;
  });
}

var traverse = {
  propstat: function(node) {
    var result = { prop: null, status: null };
    childNodes(node).forEach(function(node) {
      switch (node.localName) {
        case 'prop':
          result.prop = traverse.prop(node);
          break;
        case 'status':
          result.status = node.textContent;
          break;
      }
    });

    return result;
  },

  multistatus: function(node) {
    return children(node, 'response').map(traverse.response);
  },

  prop: function(node) {
    var result = {};
    childNodes(node).forEach(function(node) {
      if (node.nodeType === 3 /* TEXT_NODE */ && /^\s+$/.test(node.nodeValue)) {
        // Skip whitespace.
        return;
      }

      switch (node.localName) {
        case 'calendar-data':
        case 'displayname':
        case 'getctag':
        case 'getetag':
        case 'href':
          result[node.localName] = node.textContent;
          return;
        case 'supported-calendar-component-set':
          if (!(node.localName in result)) {
            result[node.localName] = [];
          }

          result[node.localName] = result[node.localName].concat(
            traverse.supportedCalendarComponentSet(node)
          );
          return;
        default:
          if (!node.hasChildNodes()) {
            return debug('Could not parse ' + node.localName + ' node.');
          }

          debug('Saw ' + node.localName + '. Will recurse.');
          result[node.localName] = traverse.prop(node);
          return;
      }
    });

    return result;
  },

  response: function(node) {
    var result = { href: null, propstats: [] };
    childNodes(node).forEach(function(node) {
      switch (node.localName) {
        case 'href':
          result.href = node.textContent;
          break;
        case 'propstat':
          result.propstats.push(traverse.propstat(node));
          break;
      }
    });

    return result;
  },

  supportedCalendarComponentSet: function(node) {
    return childNodes(node)
      .map(function(node) {
        if (node.localName !== 'comp') {
          return debug('Found unexpected ' + node.localName + ' as child of ' +
                       'supported-calendar-component-set node.');
        }

        return node.getAttribute('name');
      })
      .filter(function(name) {
        return typeof name === 'string' && name.length;
      });
  }
};

module.exports = function(string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(string, 'text/xml');
  return traverse.multistatus(child(doc, 'multistatus' ));
};
