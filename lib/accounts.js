'use strict';

var calendars = require('./calendars'),
    contacts = require('./contacts'),
    model = require('./model'),
    debug = require('debug')('dav:accounts'),
    ns = require('./namespace'),
    request = require('./request'),
    url = require('url');

/**
 * rfc 6764.
 *
 * @param {dav.Account} account to find root url for.
 */
function serviceDiscovery(account, options) {
  debug('Attempt service discovery.');
  var req = request.discovery({
    bootstrap: options.accountType,
    server: account.server
  });

  return options.xhr.send(req, { sandbox: options.sandbox });
}

/**
 * rfc 5397.
 *
 * @param {dav.Account} account to get principal url for.
 */
function principalUrl(account, options) {
  debug('Fetch principal url from context path ' + account.rootUrl + '.');
  var req = request.propfind({
    url: account.rootUrl,
    props: [ { name: 'current-user-principal', namespace: ns.DAV } ],
    depth: 0,
    mergeResponses: true
  });

  return options.xhr.send(req, { sandbox: options.sandbox })
  .then(function(response) {
    var container = response.props;
    debug('Received principal: ' + container.currentUserPrincipal);
    return url.resolve(
      account.rootUrl,
      container.currentUserPrincipal
    );
  });
}

/**
 * @param {dav.Account} account to get home url for.
 */
function homeUrl(account, options) {
  debug('Fetch home url from principal url ' + account.principalUrl + '.');
  var prop;
  if (options.accountType === 'caldav') {
    prop = { name: 'calendar-home-set', namespace: ns.CALDAV };
  } else if (options.accountType === 'carddav') {
    prop = { name: 'addressbook-home-set', namespace: ns.CARDDAV };
  }

  var req = request.propfind({
    url: account.principalUrl,
    props: [ prop ],
    mergeResponses: true
  });

  return options.xhr.send(req, { sandbox: options.sandbox })
  .then(function(response) {
    var container = response.props;

    var href;
    if (options.accountType === 'caldav') {
      debug('Received home: ' + container.calendarHomeSet);
      href = container.calendarHomeSet;
    } else if (options.accountType === 'carddav') {
      debug('Received home: ' + container.addressbookHomeSet);
      href = container.addressbookHomeSet;
    }

    return url.resolve(account.rootUrl, href);
  });
}

/**
 * @param {dav.DAVCollection} collection to fetch report set for.
 */
function supportedReportSet(collection, options) {
  debug('Checking supported report set for collection at ' + collection.url);
  var req = request.propfind({
    url: collection.url,
    props: [ { name: 'supported-report-set', namespace: ns.DAV } ],
    depth: 1,
    mergeResponses: true
  });

  return options.xhr.send(req, { sandbox: options.sandbox })
  .then(function(response) {
    return response.props.supportedReportSet;
  });
}

/**
 * @param {dav.Account} account to fetch calendars for.
 */
function fetchCalendars(account, options) {
  debug('Fetch calendars from home url ' + account.homeUrl);
  var req = request.propfind({
    url: account.homeUrl,
    props: [
      { name: 'calendar-description', namespace: ns.CALDAV },
      { name: 'calendar-timezone', namespace: ns.CALDAV },
      { name: 'displayname', namespace: ns.DAV },
      { name: 'getctag', namespace: ns.CALENDAR_SERVER },
      { name: 'resourcetype', namespace: ns.DAV },
      { name: 'supported-calendar-component-set', namespace: ns.CALDAV },
      { name: 'sync-token', namespace: ns.DAV }
    ],
    depth: 1
  });

  return options.xhr.send(req, { sandbox: options.sandbox })
  .then(function(responses) {
    debug('Found ' + responses.length + ' calendars.');
    return responses
      .filter(function(response) {
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
          url: url.resolve(account.rootUrl, response.href),
          ctag: response.props.getctag,
          displayName: response.props.displayname,
          components: response.props.supportedCalendarComponentSet,
          resourcetype: response.props.resourcetype,
          syncToken: response.props.syncToken
        });
      });
  })
  .then(function(cals) {
    return Promise.all(cals.map(function(cal) {
      var reports = supportedReportSet(cal, options)
      .then(function(value) {
        cal.reports = value;
      });
      var objects = calendars.fetchObjects(cal, options)
      .then(function(value) {
        cal.objects = value;
      });

      return Promise.all([reports, objects])
      .then(function() {
        return cal;
      });
    }));
  });
}

/**
 * @param {dav.Account} account to fetch address books for.
 */
function fetchAddressBooks(account, options) {
  debug('Fetch address books from home url ' + account.homeUrl);
  var req = request.propfind({
    url: account.homeUrl,
    props: [
      { name: 'displayname', namespace: ns.DAV },
      { name: 'getctag', namespace: ns.CALENDAR_SERVER },
      { name: 'resourcetype', namespace: ns.DAV },
      { name: 'sync-token', namespace: ns.DAV }
    ],
    depth: 1
  });

  return options.xhr.send(req, { sandbox: options.sandbox })
  .then(function(responses) {
    debug('Found ' + responses.length + ' address books.');
    return responses.map(function(response) {
      debug('Found address book named ' + response.props.displayname);
      debug('props: ' + JSON.stringify(response.props));
      return new model.AddressBook({
        data: response,
        account: account,
        url: url.resolve(account.rootUrl, response.href),
        ctag: response.props.getctag,
        displayName: response.props.displayname,
        resourcetype: response.props.resourcetype,
        syncToken: response.props.syncToken
      });
    });
  })
  .then(function(addressBooks) {
    return Promise.all(addressBooks.map(function(addressBook) {
      var reports = supportedReportSet(addressBook, options)
      .then(function(value) {
        addressBook.reports = value;
      });
      var objects = contacts.fetchObjects(addressBook, options)
      .then(function(value) {
        addressBook.objects = value;
      });

      return Promise.all([reports, objects])
      .then(function() {
        return addressBook;
      });
    }));
  });
}

/**
 * Options:
 *
 *   (String) accountType - one of 'caldav' or 'carddav'.
 *       Defaults to 'caldav'.
 *   (Array.<Object>) filters - list of caldav filters to send with request.
 *   (Object) sandbox - optional request sandbox.
 *   (String) server - some url for server (needn't be base url).
 *   (String) timezone - VTIMEZONE calendar object.
 *   (dav.Transport) xhr - request sender.
 *
 * @return {Promise} a promise that will resolve with a dav.Account object.
 */
exports.create = function(options) {
  options.accountType = options.accountType || 'caldav';

  var account = new model.Account({
    server: options.server,
    credentials: options.xhr.credentials
  });

  return serviceDiscovery(account, options)
  .then(function(rootUrl) {
    account.rootUrl = rootUrl;
    return principalUrl(account, options);
  })
  .then(function(principalUrl) {
    account.principalUrl = principalUrl;
    return homeUrl(account, options);
  })
  .then(function(homeUrl) {
    account.homeUrl = homeUrl;

    if (options.accountType === 'caldav') {
      return fetchCalendars(account, options);
    } else if (options.accountType === 'carddav') {
      return fetchAddressBooks(account, options);
    }
  })
  .then(function(collection) {
    if (options.accountType === 'caldav') {
      account.calendars = collection;
    } else if (options.accountType === 'carddav') {
      account.addressBooks = collection;
    }

    return account;
  });
};
