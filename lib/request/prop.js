'use strict';

/**
 * @param {String} namespace - xmlns for prop.
 * @param {String} localName - name of prop.
 */
function Prop(namespace, localName) {
  this.namespace = namespace;
  this.localName = localName;
};
module.exports = prop;
