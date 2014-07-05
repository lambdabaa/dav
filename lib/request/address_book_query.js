'use strict';

var collectionQuery = require('./collection_query'),
    template = require('../template');

/**
 * Options:
 *
 *   (String) depth - optional value for Depth header.
 *   (Array.<Object>) props - list of props to request.
 */
module.exports = function(options) {
  return collectionQuery(
    template.addressBookQuery({
      props: options.props || []
    }),
    {
      depth: options.depth
    }
  );
};
