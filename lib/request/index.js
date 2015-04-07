/**
 * Request Object
 * @typedef {Object} Request
 * @property {string} method - Method of the request (eg. PROPFIND, REPORT, GET)
 * @property {string} data - Data to be sent with the Request.
 * @property {function(XMLHttprequest)} transformResponse - Callback that maps
 * the request result.
 */

exports.addressBookQuery = require('./address_book_query');
exports.calendarQuery = require('./calendar_query');
exports.propfind = require('./propfind');
exports.syncCollection = require('./sync_collection');
