'use strict';

var DOMParser = require('./domparser'),
    camelize = require('../camelize'),
    debug = require('debug')('davinci:parser:multistatus');

function childNodes(node) {
  var result = node.childNodes;
  if (!Array.isArray(result)) {
    result = Array.prototype.slice.call(result);
  }

  return result;
}

function children(node, localName) {
  return childNodes(node).filter(function(childNode) {
    return childNode.localName === localName;
  });
}

function child(node, localName) {
  return children(node, localName)[0];
}


var traverse = {
  multistatus: function(node) {
    var result = {};
    result.responses = children(node, 'response').map(traverse.response);
    var syncToken = child(node, 'sync-token');
    if (syncToken) {
      result.syncToken = traverse.syncToken(syncToken);
    }

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

  syncToken: function(node) {
    return node.textContent;
  },

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

  prop: function(node) {
    var result = {};
    childNodes(node).forEach(function(node) {
      if (node.nodeType === 3 /* TEXT_NODE */ && /^\s+$/.test(node.nodeValue)) {
        // Skip whitespace.
        return;
      }

      switch (node.localName) {
        case 'calendar-data':
        case 'calendar-description':
        case 'calendar-timezone':
        case 'displayname':
        case 'getctag':
        case 'getetag':
        case 'href':
        case 'sync-token':
          // String case.
          result[node.localName] = node.textContent;
          return;
        case 'supported-calendar-component-set':
        case 'supported-report-set':
          // Array case.
          if (!(node.localName in result)) {
            result[node.localName] = [];
          }

          result[node.localName] = result[node.localName].concat(
            // e.g. supported-report-set => supportedReportSet
            traverse[camelize(node.localName, '-')](node)
          );
          return;
        default:
          if (!node.hasChildNodes()) {
            // If it's not one of nodes we anticipated and it's a leaf,
            // just grab its textContent in case a consumer wants it.
            result[node.localName] = node.textContent;
            return debug('Unexpected ' + node.localName + ' node.');
          }

          debug('Saw ' + node.localName + '. Will recurse.');
          result[node.localName] = traverse.prop(node);
          return;
      }
    });

    return result;
  },

  supportedCalendarComponentSet: function(node) {
    return children(node, 'comp')
      .map(function(node) {
        return node.getAttribute('name');
      })
      .filter(function(name) {
        return typeof name === 'string' && name.length;
      });
  },

  supportedReportSet: function(node) {
    return children(node, 'supported-report')
      .map(traverse.supportedReport)
      .reduce(function(a, b) {
        return a.concat(b);
      });
  },

  supportedReport: function(node) {
    return children(node, 'report')
      .map(traverse.report)
      .reduce(function(a, b) {
        return a.concat(b);
      }, []);
  },

  report: function(node) {
    return childNodes(node).map(function(node) {
      return node.localName;
    });
  }
};

module.exports = function(string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(string, 'text/xml');
  return traverse.multistatus(child(doc, 'multistatus' ));
};
