var Calendar = require('./model').Calendar,
    debug = require('debug')('davinci:accounts'),
    request = require('./request'),
    url = require('url');

/**
 * Options:
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (String) contextPath - optional, specific caldav root.
 *   (String) server - some url for server (needn't be base url).
 */
exports.create = function(options) {
  var caldavUrl, principalUrl;

  return new Promise(function(resolve, reject) {
    if ('contextPath' in options) {
      debug('Using provided contextPath.');
      return resolve(options.contextPath);
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
    caldavUrl = url.parse(contextPath);

    // See rfc 5397.
    debug('Fetch current principal.');
    return request.propfind({
      url: contextPath,
      username: options.username,
      password: options.password,
      props: [ { name: 'current-user-principal', namespace: 'DAV' } ],
      depth: 0
    });
  })
  .then(function(props) {
    var container = props[0];
    if (!'current-user-principal' in container) {
      throw new Error('prop missing current-user-principal!');
    }

    var principal = container['current-user-principal'];
    if (!'href' in principal) {
      throw new Error('current-user-principal missing href!');
    }

    var baseUrl = caldavUrl.protocol + '//' + caldavUrl.host;
    principalUrl = url.resolve(
      url.resolve(baseUrl, caldavUrl.pathname),
      principal.href
    );

    debug('Resolved principal url to ' + principalUrl);
    return request.propfind({
      url: principalUrl,
      username: options.username,
      password: options.password,
      props: [ { name: 'displayname', namespace: 'DAV' } ],
      depth: 0,
      prefer: 'return-minimal'
    });
  })
  .then(function(props) {
    return props.map(function(container) {
      if (!'displayname' in container) {
        throw new Error('prop missing displayname!');
      }

      var calendar = new Calendar();
      calendar.principalUrl = principalUrl;
      calendar.displayName = container.displayname;
      return calendar;
    });
  });
};

exports.remove = function(account, options) {
};
