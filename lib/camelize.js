/**
 * @fileoverview Camelcase something.
 */
'use strict';

module.exports = function(str, delimiter) {
  delimiter = delimiter || '_';
  var words = str.split(delimiter);
  return [words[0]]
    .concat(
      words.slice(1).map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
    )
    .join('');
};
