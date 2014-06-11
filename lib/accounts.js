'use strict';

var calendars = require('./calendars'),
    model = require('./model'),
    debug = require('debug')('davinci:accounts'),
    request = require('./request'),
    url = require('url');

/**
 * rfc 6764.
 *
 * @param {davinci.Account} account to find caldav url for.
 */
function serviceDiscovery(account, options) {
  debug('Attempt service discovery.');
  return request.discovery({
    bootstrap: 'caldav',
    username: account.username,
    password: account.password,
    server: account.server,
    sandbox: options.sandbox
  })
  .send();
}

/**
 * rfc 5397.
 *
 * @param {davinci.Account} account to get principal url for.
 */
function principalUrl(account, options) {
  debug('Fetch principal url from context path ' + account.caldavUrl + '.');
  return request.propfind({
    url: account.caldavUrl,
    username: account.username,
    password: account.password,
    sandbox: options.sandbox,
    props: [ { name: 'current-user-principal', namespace: 'd' } ],
    depth: 0,
    mergeResponses: true
  })
  .send()
  .then(function(response) {
    var container = response.props;
    return url.resolve(
      account.caldavUrl,
      container['current-user-principal'].href
    );
  });
}

/**
 * @param {davinci.Account} account to get home url for.
 */
function homeUrl(account, options) {
  debug('Fetch home url from principal url ' + account.principalUrl + '.');
  return request.propfind({
    url: account.principalUrl,
    username: account.username,
    password: account.password,
    sandbox: options.sandbox,
    props: [ { name: 'calendar-home-set', namespace: 'c' } ],
    mergeResponses: true
  })
  .send()
  .then(function(response) {
    var container = response.props;
    return url.resolve(
      account.caldavUrl,
      container['calendar-home-set'].href
    );
  });
}

/**
 * @param {davinci.Account} account to fetch calendars for.
 */
function getCalendars(account, options) {
  debug('Fetch calendars from home url ' + account.homeUrl);
  return request.propfind({
    url: account.homeUrl,
    username: account.username,
    password: account.password,
    sandbox: options.sandbox,
    props: [
      { name: 'calendar-description', namespace: 'c' },
      { name: 'calendar-timezone', namespace: 'c' },
      { name: 'displayname', namespace: 'd' },
      { name: 'getctag', namespace: 'cs' },
      { name: 'supported-calendar-component-set', namespace: 'c' }
    ],
    depth: 1
  })
  .send()
  .then(function(responses) {
    return responses.filter(function(response) {
      // We only want the calendar object if it does events.
      var components = response.props['supported-calendar-component-set'];
      return components && components.indexOf('VEVENT') !== -1;
    })
    .map(function(response) {
      debug('Found calendar named ' + response.props.displayname);
      return new model.Calendar({
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
      return calendars.fetchObjects(cal, options).then(function(objects) {
        cal.objects = objects;
        return cal;
      });
    });

    return Promise.all(fetches);
  });
}

/**
 * Options:
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (String) server - some url for server (needn't be base url).
 *   (Object) sandbox - optional request sandbox.
 *   (String) timezone - VTIMEZONE calendar object.
 *
 * @return {Promise} a promise that will resolve with a davinci.Account object.
 */
exports.create = function(options) {
  var account = new model.Account({
    server: options.server,
    username: options.username,
    password: options.password
  });

  return serviceDiscovery(account, options).then(function(caldavUrl) {
    account.caldavUrl = caldavUrl;
    return principalUrl(account, options);
  })
  .then(function(principalUrl) {
    account.principalUrl = principalUrl;
    return homeUrl(account, options);
  })
  .then(function(homeUrl) {
    account.homeUrl = homeUrl;
    return getCalendars(account, options);
  })
  .then(function(calendars) {
    account.calendars = calendars;
    return account;
  });
};
