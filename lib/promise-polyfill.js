/**
 * Promise polyfill
 */
if (typeof(Promise) === 'undefined') {
  /*jshint -W079 */
  var Promise = require('es6-promise').Promise;
  /*jshint +W079 */
  /*global window */
  if (typeof(window) !== 'undefined') {
    window.Promise = Promise;
  } else {
    global.Promise = Promise;
  }
}
