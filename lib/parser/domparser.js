/* global self */
var Native;
if (typeof self !== 'undefined' && 'DOMParser' in self) {
  // browser main thread
  Native = self.DOMParser;
} else {
  // nodejs or web worker
  Native = require('xmldom').DOMParser;
}
module.exports = Native;
