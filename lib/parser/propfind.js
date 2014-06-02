var _ = require('underscore'),
    DOMParser = require('./domparser'),
    debug = require('debug')('davinci:parser:propfind');

module.exports = function(string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(string, 'text/xml');
  return traverse.propfind(doc);
};

var traverse = {
  propstat: function(node) {
    var result = { prop: null, status: null };
    Array.prototype.slice.call(node.childNodes).forEach(function(node) {
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
    return traverse.response(
      _.find(Array.prototype.slice.call(node.childNodes), function(node) {
        return node.localName === 'response';
      })
    );
  },

  prop: function(node) {
    var result = {};
    Array.prototype.slice.call(node.childNodes).forEach(function(node) {
      switch (node.localName) {
        case 'displayname':
        case 'getctag':
        case 'href':
          result[node.localName] = node.textContent;
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

  propfind: function(doc) {
    return traverse.multistatus(
      _.find(Array.prototype.slice.call(doc.childNodes), function(node) {
        return node.localName === 'multistatus';
      })
    );
  },

  response: function(node) {
    var result = { href: null, propstats: [] };
    Array.prototype.slice.call(node.childNodes).forEach(function(node) {
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
  }
};
