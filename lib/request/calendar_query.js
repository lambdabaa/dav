'use strict';

var collectionQuery = require('./collection_query'),
    template = require('../template');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) filters - list of filters to send with request.
 *   (Array.<Object>) props - list of props to request.
 *   (String) timezone - VTIMEZONE calendar object.
 */
module.exports = function(options) {
  return collectionQuery(
    template.calendarQuery({
      props: options.props || [],
      filters: options.filters || [],
      timezone: options.timezone
    }),
    {
      depth: options.depth
    }
  );
};
