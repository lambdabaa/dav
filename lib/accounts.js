import url from 'url';

import { listCalendars } from './calendars';
import { listAddressBooks } from './contacts';
import { Account } from './model';
import * as ns from './namespace';
import * as request from './request';

let debug = require('debug')('dav:accounts');

/**
 * rfc 6764.
 *
 * @param {dav.Account} account to find root url for.
 */
async function serviceDiscovery(account, options) {
  debug('Attempt service discovery.');

  let endpoint = url.parse(account.server);
  endpoint.protocol = endpoint.protocol || 'http';  // TODO(gareth) https?

  let uri = url.format({
    protocol: endpoint.protocol,
    host: endpoint.host,
    pathname: `/.well-known/${options.accountType}`
  });

  let req = request.basic({ method: 'GET' });
  try {
    let xhr = await options.xhr.send(req, uri, { sandbox: options.sandbox });
    if (xhr.status >= 300 && xhr.status < 400) {
      // http redirect.
      let location = xhr.getResponseHeader('Location');
      if (typeof location === 'string' && location.length) {
        debug(`Discovery redirected to ${location}`);
        return url.format({
          protocol: endpoint.protocol,
          host: endpoint.host,
          pathname: location
        });
      }
    }

    return endpoint.href;
  } catch (error) {
    // If discovery failed, just failover to the provided url.
    return endpoint.href;
  }
}

/**
 * rfc 5397.
 *
 * @param {dav.Account} account to get principal url for.
 */
async function principalUrl(account, options) {
  debug(`Fetch principal url from context path ${account.rootUrl}.`);
  let req = request.propfind({
    props: [ { name: 'current-user-principal', namespace: ns.DAV } ],
    depth: 0,
    mergeResponses: true
  });

  let res = await options.xhr.send(req, account.rootUrl, {
    sandbox: options.sandbox
  });

  let container = res.props;
  debug(`Received principal: ${container.currentUserPrincipal}`);
  return url.resolve(account.rootUrl, container.currentUserPrincipal);
}

/**
 * @param {dav.Account} account to get home url for.
 */
async function homeUrl(account, options) {
  debug(`Fetch home url from principal url ${account.principalUrl}.`);
  let prop;
  if (options.accountType === 'caldav') {
    prop = { name: 'calendar-home-set', namespace: ns.CALDAV };
  } else if (options.accountType === 'carddav') {
    prop = { name: 'addressbook-home-set', namespace: ns.CARDDAV };
  }

  var req = request.propfind({ props: [ prop ] });

  let responses = await options.xhr.send(req, account.principalUrl, {
    sandbox: options.sandbox
  });

  let response = responses.find(
    res => account.principalUrl.indexOf(res.href) !== -1
  );

  let container = response.props;
  let href;
  if (options.accountType === 'caldav') {
    debug(`Received home: ${container.calendarHomeSet}`);
    href = container.calendarHomeSet;
  } else if (options.accountType === 'carddav') {
    debug(`Received home: ${container.addressbookHomeSet}`);
    href = container.addressbookHomeSet;
  }

  return url.resolve(account.rootUrl, href);
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
export async function createAccount(options) {
  options.accountType = options.accountType || 'caldav';
  if (typeof options.loadCollections !== 'boolean') {
    options.loadCollections = true;
  }
  if (typeof options.loadObjects !== 'boolean') {
    options.loadObjects = options.loadCollections;
  }

  let account = new Account({
    server: options.server,
    credentials: options.xhr.credentials
  });

  account.rootUrl = await serviceDiscovery(account, options);
  account.principalUrl = await principalUrl(account, options);
  account.homeUrl = await homeUrl(account, options);

  if (!options.loadCollections) {
    return account;  // Nothing more to do here.
  }

  if (options.accountType === 'caldav') {
    account.calendars = await listCalendars(account, options);
  } else if (options.accountType === 'carddav') {
    account.addressBooks = await listAddressBooks(account, options);
  }

  return account;
}
