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

  var endpoint = url.parse(account.server);
  endpoint.protocol = endpoint.protocol || 'http';  // TODO(gareth) https?

  var uri = url.format({
    protocol: endpoint.protocol,
    host: endpoint.host,
    pathname: '/.well-known/' + options.accountType
  });

  var req = request.basic({ method: 'GET' });
  return options.xhr.send(req, uri, { sandbox: options.sandbox })
  .then(function(xhr) {
    if (xhr.status >= 300 && xhr.status < 400) {
      // http redirect.
      var location = xhr.getResponseHeader('Location');
      if (typeof location === 'string' && location.length) {
        debug('Discovery redirected to ' + location);
        return url.format({
          protocol: endpoint.protocol,
          host: endpoint.host,
          pathname: location
        });
      }
    }

    return endpoint.href;
  })
  .catch(function() {
    // If discovery failed, just failover to the provided url.
    return endpoint.href;
  });
}

/**
 * rfc 5397.
 *
 * @param {dav.Account} account to get principal url for.
 */
function principalUrl(account, options) {
  debug('Fetch principal url from context path ' + account.rootUrl + '.');
  var req = request.propfind({
    props: [ { name: 'current-user-principal', namespace: ns.DAV } ],
    depth: 0,
    mergeResponses: true
  });

  return options.xhr.send(req, account.rootUrl, { sandbox: options.sandbox })
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
    props: [ prop ],
    mergeResponses: true
  });

  return options.xhr.send(req, account.principalUrl, {
    sandbox: options.sandbox
  })
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
 * Options:
 *
 *   (String) accountType - one of 'caldav' or 'carddav'. Defaults to 'caldav'.
 *   (Array.<Object>) filters - list of caldav filters to send with request.
 *   (Boolean) loadCollections - whether or not to load dav collections.
 *   (Boolean) loadObjects - whether or not to load dav objects.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (String) server - some url for server (needn't be base url).
 *   (String) timezone - VTIMEZONE calendar object.
 *   (dav.Transport) xhr - request sender.
 *
 * @return {Promise} a promise that will resolve with a dav.Account object.
 */
exports.create = function(options) {
  options.accountType = options.accountType || 'caldav';
  if (typeof options.loadCollections !== 'boolean') {
    options.loadCollections = true;
  }
  if (typeof options.loadObjects !== 'boolean') {
    options.loadObjects = options.loadCollections;
  }

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

    if (!options.loadCollections) {
      return;  // Nothing more to do here.
    }

    if (options.accountType === 'caldav') {
      return calendars.listCalendars(account, options);
    } else if (options.accountType === 'carddav') {
      return contacts.listAddressBooks(account, options);
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
