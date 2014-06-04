/* global window */
module.exports = typeof(window) !== 'undefined' ?
  window.DOMParser :
  require('xmldom').DOMParser;
