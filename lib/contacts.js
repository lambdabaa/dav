'use strict';

var debug = require('debug')('dav:contacts'),
    model = require('./model'),
    ns = require('./namespace'),
    request = require('./request'),
    url = require('url');

/**
 * @param {dav.AddressBook} addressBook the address book to put the object on.
 * @return {Promise} promise will resolve when the card has been created.
 *
 * Options:
 *
 *   (String) data - vcard object.
 *   (String) filename - name for the address book vcf file.
 *   (Object) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.createCard = function(addressBook, options) {
  var cardUrl = url.resolve(addressBook.url, options.filename);
  var req = request.basic({
    method: 'PUT',
    url: cardUrl,
    data: options.data
  });

  return options.xhr.send(req, { sandbox: options.sandbox });
};

/**
 * @param {dav.VCard} card updated vcard object.
 * @return {Promise} promise will resolve when the card has been updated.
 *
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.updateCard = function(card, options) {
  var req = request.basic({
    method: 'PUT',
    url: card.url,
    data: card.addressData,
    etag: card.etag
  });

  return options.xhr.send(req, { sandbox: options.sandbox });
};

/**
 * @param {dav.VCard} card target vcard object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.deleteCard = function(card, options) {
  var req = request.basic({
    method: 'DELETE',
    url: card.url,
    etag: card.etag
  });

  return options.xhr.send(req, { sandbox: options.sandbox });
};

/**
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 */
function fetchObjects(addressBook, options) {
  debug('Doing REPORT on address book ' + addressBook.url +
        'which belongs to ' + addressBook.account.credentials.username);

  var req = request.addressBookQuery({
    url: addressBook.url,
    depth: 1,
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'address-data', namespace: ns.CARDDAV }
    ]
  });

  return options.xhr.send(req, { sandbox: options.sandbox })
  .then(function(responses) {
    return responses.map(function(response) {
      debug('Found vcard with url ' + response.href);
      return new model.VCard({
        data: response,
        addressBook: addressBook,
        url: url.resolve(addressBook.account.rootUrl, response.href),
        etag: response.props.getetag,
        addressData: response.props.addressData
      });
    });
  });
}
exports.fetchObjects = fetchObjects;

function basicSync(addressBook, options) {
  return new Promise(function(resolve, reject) {
    if (!addressBook.ctag) {
      debug('Missing ctag.');
      return resolve(false);
    }

    debug('Fetch remote getctag prop.');
    var req = request.propfind({
      url: addressBook.account.homeUrl,
      props: [ { name: 'getctag', namespace: ns.CALENDAR_SERVER } ],
      depth: 0
    });

    return options.xhr.send(req, { sandbox: options.sandbox })
    .then(function(responses) {
      debug('Found ' + responses.length + ' address books. ' +
            'Will search for calendar from ' + addressBook.url);
      var response = responses.filter(function(response) {
        // Find the response that corresponds to the parameter calendar.
        return addressBook.url.indexOf(response.href) !== -1;
      })[0];

      if (!response) {
        reject(new Error('Could not find remote address book. ' +
                         'Perhaps it was deleted?'));
      }

      debug('Check whether the ctag we have cached matches the one ' +
            'we just fetched from the remote server.');
      return resolve(addressBook.ctag !== response.props.getctag);
    });
  })
  .then(function(sync) {
    if (!sync) {
      debug('Local ctag matched remote! No need to sync :).');
      return addressBook;
    }

    debug('ctag changed so we need to fetch stuffs.');
    return fetchObjects(addressBook, options)
    .then(function(objects) {
      addressBook.objects = objects;
      return addressBook;
    });
  });
}

function webdavSync(addressBook, options) {
  var req = request.syncCollection({
    url: addressBook.url,
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'address-data', namespace: ns.CARDDAV }
    ],
    syncLevel: 1,
    syncToken: addressBook.syncToken
  });

  return options.xhr.send(req, { sandbox: options.sandbox })
  .then(function(result) {
    // TODO(gareth): Handle creations and deletions.
    result.responses.forEach(function(response) {
      // Find the vcard that this response corresponds with.
      var vcard = addressBook.objects.filter(function(object) {
        return object.url.indexOf(response.href) !== -1;
      })[0];

      if (!vcard) {
        return;
      }

      vcard.etag = response.props.getetag;
      vcard.addressData = response.props.addressData;
    });

    addressBook.syncToken = result.syncToken;
    return addressBook;
  });
}

/**
 * @param {dav.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *
 *   (Object) sandbox - optional request sandbox.
 *   (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
 *       try to do webdav sync and failover to basic sync if rfc 6578 is not
 *       supported by the server.
 *   (dav.Transport) xhr - request sender.
 */
exports.sync = function(addressBook, options) {
  var syncMethod;
  if ('syncMethod' in options) {
    syncMethod = options.syncMethod;
  } else {
    syncMethod = (addressBook.reports &&
                  addressBook.reports.indexOf('syncCollection') !== -1) ?
      'webdav' :
      'basic';
  }

  if (syncMethod === 'webdav') {
    debug('rfc 6578 sync.');
    return webdavSync(addressBook, options);
  } else {
    debug('basic sync.');
    return basicSync(addressBook, options);
  }
};
