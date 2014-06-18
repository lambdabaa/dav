'use strict';

var calendars = require('./calendars'),
    model = require('./model'),
    debug = require('debug')('davinci:accounts'),
    namespace = require('./namespace'),
    request = require('./request'),
    transport = require('./transport'),
    url = require('url');

/**
 * rfc 6764.
 *
 * @param {davinci.Transport} xhr request sender.
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
 * @param {davinci.Transport} xhr request sender.
 * @param {davinci.Account} account to get principal url for.
 */
function principalUrl(xhr, account, options) {
  debug('Fetch principal url from context path ' + account.caldavUrl + '.');
  var req = request.propfind({
    url: account.caldavUrl,
    props: [ { name: 'current-user-principal', namespace: namespace.DAV } ],
    depth: 0,
    mergeResponses: true
  });

  return xhr.send(req, {
    sandbox: options.sandbox
  })
  .then(function(response) {
    var container = response.props;
    debug('Received principal: ' + container.currentUserPrincipal);
    return url.resolve(
      account.caldavUrl,
      container.currentUserPrincipal
    );
  });
}

/**
 * @param {davinci.Transport} xhr request sender.
 * @param {davinci.Account} account to get home url for.
 */
function homeUrl(xhr, account, options) {
  debug('Fetch home url from principal url ' + account.principalUrl + '.');
  var req = request.propfind({
    url: account.principalUrl,
    props: [ { name: 'calendar-home-set', namespace: namespace.CALDAV } ],
    mergeResponses: true
  });

  return xhr.send(req, {
    sandbox: options.sandbox
  })
  .then(function(response) {
    var container = response.props;
    debug('Received home: ' + container.calendarHomeSet);
    return url.resolve(
      account.caldavUrl,
      container.calendarHomeSet
    );
  });
}

/**
 * @param {davinci.Transport} xhr request sender.
 * @param {davinci.Account} calendar to fetch report set for.
 */
function supportedReportSet(xhr, calendar, options) {
  debug('Checking supported report set for calendar at ' + calendar.url);
  var req = request.propfind({
    url: calendar.url,
    props: [ { name: 'supported-report-set', namespace: namespace.DAV } ],
    depth: 1,
    mergeResponses: true
  });

  return xhr.send(req, { sandbox: options.sandbox }).then(function(response) {
    return response.props.supportedReportSet;
  });
}

/**
 * @param {davinci.Transport} xhr request sender.
 * @param {davinci.Account} account to fetch calendars for.
 */
function fetchCalendars(xhr, account, options) {
  debug('Fetch calendars from home url ' + account.homeUrl);
  var req = request.propfind({
    url: account.homeUrl,
    props: [
      { name: 'calendar-description', namespace: namespace.CALDAV },
      { name: 'calendar-timezone', namespace: namespace.CALDAV },
      { name: 'displayname', namespace: namespace.DAV },
      { name: 'getctag', namespace: namespace.CALENDAR_SERVER },
      { name: 'supported-calendar-component-set', namespace: namespace.CALDAV },
      { name: 'sync-token', namespace: namespace.DAV }
    ],
    depth: 1
  });

  return xhr.send(req, {
    sandbox: options.sandbox
  })
  .then(function(responses) {
    debug('Found ' + responses.length + ' calendars.');
    return responses.filter(function(response) {
      // We only want the calendar object if it does events.
      var components = response.props.supportedCalendarComponentSet;
      return components && components.indexOf('VEVENT') !== -1;
    })
    .map(function(response) {
      debug('Found calendar named ' + response.props.displayname);
      debug('props: ' + JSON.stringify(response.props));
      return new model.Calendar({
        data: response,
        account: account,
        description: response.props.calendarDescription,
        timezone: response.props.calendarTimezone,
        url: url.resolve(account.caldavUrl, response.href),
        ctag: response.props.getctag,
        displayName: response.props.displayname,
        components: response.props.supportedCalendarComponentSet,
        syncToken: response.props.syncToken
      });
    });
  })
  .then(function(cals) {
    return Promise.all(cals.map(function(cal) {
      return Promise.all([
        supportedReportSet(xhr, cal, options).then(function(value) {
          cal.reports = value;
        }),
        calendars.fetchObjects(xhr, cal, options).then(function(value) {
          cal.objects = value;
        })
      ])
      .then(function() {
        return cal;
      });
    }));
  });
}

/**
 * Options:
 *
 *   (Array.<Object>) filters - list of caldav filters to send with request.
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
