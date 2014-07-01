var Native;
if (typeof this.DOMParser !== 'undefined') {
  Native = this.DOMParser;
} else {
  Native = require('xmldom').DOMParser;
}
module.exports = Native;
