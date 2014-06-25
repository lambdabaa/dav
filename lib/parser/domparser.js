/* global window */
module.exports = typeof(window) !== 'undefined' ?
  window.DOMParser :
  // Trick browserify into not bundling xmldom in the browser binary.
  require(false || 'xmldom').DOMParser;
