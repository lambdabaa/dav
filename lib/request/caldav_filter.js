'use strict';

/**
 * @param {String} type - one of 'comp-filter' or 'time-filter'.
 * @param {Object} attrs - map from attribute names to values.
 * @param {Array.<CaldavFilter>} children - sub filters.
 */
function CaldavFilter(type, attrs, children) {
  this.type = type;
  this.attrs = attrs;
  this.children = children || [];
}
module.exports = CaldavFilter;
