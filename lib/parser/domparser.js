var Native;
if (typeof DOMParser !== 'undefined') {
  Native = DOMParser;
} else {
  Native = require('xmldom').DOMParser;
}
module.exports = Native;
