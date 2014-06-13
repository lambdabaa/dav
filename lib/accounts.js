'use strict';

var calendars = require('./calendars'),
    model = require('./model'),
    debug = require('debug')('davinci:accounts'),
    request = require('./request'),
    transport = require('./transport'),
    url = require('url');

/**
 * rfc 6764.
 *
 * @param {davinci.transport.Basic} xhr request sender.
 * @param {davinci.Account} account to find caldav url for.
 */
function serviceDiscovery(xhr, account, options) {
  debug('Attempt service discovery.');
  var req = request.discovery({
    bootstrap: 'caldav',
    server: account.server
  });

  return xhr.send(req, { sandbox: options.sandbox });
}

/**
 * rfc 5397.
 *
 * @param {davinci.transport.Basic} xhr request sender.
 * @param {davinci.Account} account to get principal url for.
 */
function principalUrl(xhr, account, options) {
  debug('Fetch principal url from context path ' + account.caldavUrl + '.');
  var req = request.propfind({
    url: account.caldavUrl,
    props: [ { name: 'current-user-principal', namespace: 'd' } ],
    depth: 0,
    mergeResponses: true
  });

  return xhr.send(req, {
    sandbox: options.sandbox
  })
  .then(function(response) {
    var container = response.props;
    return url.resolve(
      account.caldavUrl,
      container['current-user-principal'].href
    );
  });
}

/**
 * @param {davinci.transport.Basic} xhr request sender.
 * @param {davinci.Account} account to get home url for.
 */
function homeUrl(xhr, account, options) {
  debug('Fetch home url from principal url ' + account.principalUrl + '.');
  var req = request.propfind({
    url: account.principalUrl,
    props: [ { name: 'calendar-home-set', namespace: 'c' } ],
    mergeResponses: true
  });

  return xhr.send(req, {
    sandbox: options.sandbox
  })
  .then(function(response) {
    var container = response.props;
    return url.resolve(
      account.caldavUrl,
      container['calendar-home-set'].href
    );
  });
}

/**
 * @param {davinci.transport.Basic} xhr request sender.
 * @param {davinci.Account} account to fetch calendars for.
 */
function fetchCalendars(xhr, account, options) {
  debug('Fetch calendars from home url ' + account.homeUrl);
  var req = request.propfind({
    url: account.homeUrl,
    props: [
      { name: 'calendar-description', namespace: 'c' },
      { name: 'calendar-timezone', namespace: 'c' },
      { name: 'displayname', namespace: 'd' },
      { name: 'getctag', namespace: 'cs' },
      { name: 'supported-calendar-component-set', namespace: 'c' }
    ],
    depth: 1
  });

  return xhr.send(req, {
    sandbox: options.sandbox
  })
  .then(function(responses) {
    return responses.filter(function(response) {
      // We only want the calendar object if it does events.
      var components = response.props['supported-calendar-component-set'];
      return components && components.indexOf('VEVENT') !== -1;
    })
    .map(function(response) {
      debug('Found calendar named ' + response.props.displayname);
      return new model.Calendar({
        data: response,
        account: account,
        description: response.props['calendar-description'],
        timezone: response.props['calendar-timezone'],
        url: url.resolve(account.caldavUrl, response.href),
        ctag: response.props.getctag,
        displayName: response.props.displayname,
        components: response.props['supported-calendar-component-set']
      });
    });
  })
  .then(function(cals) {
    var fetches = cals.map(function(cal) {
      return calendars.fetchObjects(xhr, cal, options).then(function(objects) {
        cal.objects = objects;
        return cal;
      });
    });

    return Promise.all(fetches);
  });
}

/**
 * Options:
 *
 *   (String) password - plaintext password for calendar user.
 *   (Object) sandbox - optional request sandbox.
 *   (String) server - some url for server (needn't be base url).
 *   (String) timezone - VTIMEZONE calendar object.
 *   (String) username - username (perhaps email) for calendar user.
 *   (davinci.Transport) xhr - optional request sender.
 *
 * @return {Promise} a promise that will resolve with a davinci.Account object.
 */
exports.create = function(options) {
  var credentials = new model.Credentials({
    username: options.username,
    password: options.password
  });

  var account = new model.Account({
    server: options.server,
    credentials: credentials
  });

  var xhr = options.xhr || new transport.Basic(credentials);
  return serviceDiscovery(
    xhr,
    account,
    options
  )
  .then(function(caldavUrl) {
    account.caldavUrl = caldavUrl;
    return principalUrl(xhr, account, options);
  })
  .then(function(principalUrl) {
    account.principalUrl = principalUrl;
    return homeUrl(xhr, account, options);
  })
  .then(function(homeUrl) {
    account.homeUrl = homeUrl;
    return fetchCalendars(xhr, account, options);
  })
  .then(function(calendars) {
    account.calendars = calendars;
    return account;
  });
};
