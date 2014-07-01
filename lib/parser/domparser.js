/* global window */
module.exports = (typeof window !== 'undefined' && 'DOMParser' in window) ?
  window.DOMParser :
  require('xmldom').DOMParser;
