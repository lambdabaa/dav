/* global self */
var Native;
if (typeof self !== 'undefined' && 'XMLHttpRequest' in self) {
  Native = self.XMLHttpRequest;
} else {
  // Trick browserify into not loading XMLHttpRequest polyfill
  // since it is available in the platform (including web workers)
  Native = require(false || 'xmlhttprequest').XMLHttpRequest;
}
module.exports = Native;
