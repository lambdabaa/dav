'use strict';

var compile = require('handlebars').compile;

// Needs to be on another line since github.com/substack/brfs/issues/28.
var fs = require('fs');

require('./helpers');  // Augment Handlebars with our custom helpers.

exports.addressBookQuery = compile(
  fs.readFileSync(__dirname + '/address_book_query.hbs', 'utf-8')
);
exports.calendarQuery = compile(
  fs.readFileSync(__dirname + '/calendar_query.hbs', 'utf-8')
);
exports.propfind = compile(
  fs.readFileSync(__dirname + '/propfind.hbs', 'utf-8')
);
exports.syncCollection = compile(
  fs.readFileSync(__dirname + '/sync_collection.hbs', 'utf-8')
);
