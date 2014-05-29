var debug = require('debug')('davinci:accounts'),
    request = require('./request');

/**
 * Options:
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (String) contextPath - optional, specific caldav root.
 *   (String) server - some url for server (needn't be base url).
 */
exports.create = function(options) {
  return new Promise(function(resolve, reject) {
    if ('contextPath' in options) {
      debug('Using provided contextPath.');
      return resolve(options.href);
    }

    debug('Attempt service discovery.');
    return request.discovery({
      bootstrap: 'caldav',
      server: options.server,
      username: options.username,
      password: options.password
    })
    .then(function(contextPath) {
      resolve(contextPath);
    });
  })
  .then(function(contextPath) {
    // See rfc 5397.
    debug('Fetch current principal.');
    return request.propfind({
      url: contextPath,
      username: options.username,
      password: options.password,
      props: ['current-user-principal'],
      depth: 0
    });
  });
};

exports.remove = function(account, options) {
};
