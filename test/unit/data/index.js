var fs = require('fs');

exports.currentUserPrincipal = fs
  .readFileSync(__dirname + '/current_user_principal.xml', 'utf-8')
  .replace(/>\s+</g, '><');  // Remove whitespace between close and open tag.
