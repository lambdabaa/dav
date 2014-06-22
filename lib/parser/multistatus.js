'use strict';

var DOMParser = require('./domparser'),
    camelize = require('../camelize'),
    debug = require('debug')('dav:parser:multistatus');

var traverse = {
  multistatus: function(node) {
    // { response: [x, y, z] }
    return complex(node, {
      response: true
    });
  },

  response: function(node) {
    // { propstat: [x, y, z] }
    return complex(node, {
      propstat: true
    });
  },

  propstat: function(node) {
    // { prop: x }
    return complex(node, {
      prop: false
    });
  },

  prop: function(node) {
    // {
    //   resourcetype: x
    //   supportedCalendarComponentSet: y,
    //   supportedReportSet: z
    // }
    return complex(node, {
      resourcetype: false,
      supportedCalendarComponentSet: false,
      supportedReportSet: false
    });
  },

  resourcetype: function(node) {
    return childNodes(node).map(function(childNode) {
      return childNode.localName;
    });
  },

  supportedCalendarComponentSet: function(node) {
    // [x, y, z]
    return complex(node, {
      comp: true
    }, 'comp' /* collapse */);
  },

  supportedReportSet: function(node) {
    // [x, y, z]
    return complex(node, {
      supportedReport: true
    }, 'supportedReport' /* collapse */);
  },

  comp: function(node) {
    return node.getAttribute('name');
  },

  supportedReport: function(node) {
    // x
    return complex(node, {
      report: false
    }, 'report' /* collapse */);
  },

  report: function(node) {
    return childNodes(node).map(function(childNode) {
      return childNode.localName;
    });
  }
};

function complex(node, childspec, collapse) {
  var result = {};
  Object.keys(childspec).forEach(function(key) {
    if (childspec[key]) {
      // Create array since we're expecting multiple.
      result[key] = [];
    }
  });

  childNodes(node).forEach(function(childNode) {
    traverseChild(node, childNode, childspec, result);
  });

  return maybeCollapse(result, childspec, collapse);
}

/**
 * Parse child childNode of node with childspec and write outcome to result.
 */
function traverseChild(node, childNode, childspec, result) {
  if (childNode.nodeType === 3 && /^\s+$/.test(childNode.nodeValue)) {
    // Whitespace... nothing to do.
    return;
  }

  var localName = childNode.localName,
      camelCase = camelize(localName, '-');

  if (!(camelCase in childspec)) {
    debug('Unexpected node of type ' + localName + ' encountered while ' +
          'parsing ' + node.localName + ' node!');
    var value = childNode.textContent;
    if (camelCase in result) {
      if (!Array.isArray(result[camelCase])) {
        // Since we've already encountered this node type and we haven't yet
        // made an array for it, make an array now.
        result[camelCase] = [result[camelCase]];
      }

      result[camelCase].push(value);
      return;
    }

    // First time we're encountering this node.
    result[camelCase] = value;
    return;
  }

  if (childspec[camelCase]) {
    // Expect multiple.
    result[camelCase].push(traverse[camelCase](childNode));
  } else {
    // Expect single.
    result[camelCase] = traverse[camelCase](childNode);
  }
}

function maybeCollapse(result, childspec, collapse) {
  if (!collapse) {
    return result;
  }

  if (!childspec[collapse]) {
    return result[collapse];
  }

  // Collapse array.
  return result[collapse].reduce(function(a, b) {
    return a.concat(b);
  }, []);
}

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

module.exports = function(string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(string, 'text/xml');
  var result = traverse.multistatus(child(doc, 'multistatus'));
  debug('input:\n' + string + '\n' +
        'output:\n' + JSON.stringify(result) + '\n');
  return result;
};
