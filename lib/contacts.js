'use strict';

var debug = require('debug')('dav:contacts'),
    model = require('./model'),
    ns = require('./namespace'),
    request = require('./request'),
    url = require('url'),
    webdav = require('./webdav');

/**
 * @param {dav.Account} account to fetch address books for.
 */
exports.listAddressBooks = function(account, options) {
  debug('Fetch address books from home url ' + account.homeUrl);
  var req = request.propfind({
    props: [
      { name: 'displayname', namespace: ns.DAV },
      { name: 'getctag', namespace: ns.CALENDAR_SERVER },
      { name: 'resourcetype', namespace: ns.DAV },
      { name: 'sync-token', namespace: ns.DAV }
    ],
    depth: 1
  });

  return options.xhr.send(req, account.homeUrl, { sandbox: options.sandbox })
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
      var promises = [];

      promises.push(
        webdav.supportedReportSet(addressBook, options)
        .then(function(value) {
          addressBook.reports = value;
        })
      );

      if (options.loadObjects) {
        promises.push(
          exports.listVCards(addressBook, options)
          .then(function(value) {
            addressBook.objects = value;
          })
        );
      }

      return Promise.all(promises)
      .then(function() {
        return addressBook;
      });
    }));
  });
};

/**
 * @param {dav.AddressBook} addressBook the address book to put the object on.
 * @return {Promise} promise will resolve when the card has been created.
 *
 * Options:
 *
 *   (String) data - vcard object.
 *   (String) filename - name for the address book vcf file.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.createCard = function(addressBook, options) {
  var objectUrl = url.resolve(addressBook.url, options.filename);
  return webdav.createObject(objectUrl, options.data, options);
};

/**
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 */
exports.listVCards = function(addressBook, options) {
  debug('Doing REPORT on address book ' + addressBook.url +
        'which belongs to ' + addressBook.account.credentials.username);

  var req = request.addressBookQuery({
    depth: 1,
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'address-data', namespace: ns.CARDDAV }
    ]
  });

  return options.xhr.send(req, addressBook.url, { sandbox: options.sandbox })
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
};

/**
 * @param {dav.VCard} card updated vcard object.
 * @return {Promise} promise will resolve when the card has been updated.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.updateCard = function(card, options) {
  return webdav.updateObject(
    card.url,
    card.addressData,
    card.etag,
    options
  );
};

/**
 * @param {dav.VCard} card target vcard object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.deleteCard = function(card, options) {
  return webdav.deleteObject(
    card.url,
    card.etag,
    options
  );
};

/**
 * @param {dav.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
 *       try to do webdav sync and failover to basic sync if rfc 6578 is not
 *       supported by the server.
 *   (dav.Transport) xhr - request sender.
 */
exports.sync = function(addressBook, options) {
  options.basicSync = basicSync;
  options.webdavSync = webdavSync;
  return webdav.syncCollection(addressBook, options);
};

/**
 * @param {dav.Account} account the account to fetch updates for.
 * @return {Promise} promise will resolve with updated account.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
exports.syncAccount = function(account, options) {
  if (!options) {
    options = {};
  }
  options.loadObjects = false;

  if (!account.addressBooks) {
    account.addressBooks = [];
  }

  return exports.listAddressBooks(account, options)
  .then(function(addressBooks) {
    addressBooks
      .filter(function(addressBook) {
        // Filter the address books not previously seen.
        return account.addressBooks.every(function(prev) {
          return prev.url.indexOf(addressBook.url) === -1;
        });
      })
      .forEach(function(addressBook) {
        account.addressBooks.push(addressBook);
      });

    options.loadObjects = true;
    return Promise.all(
      account.addressBooks.map(function(addressBook, index) {
        return exports.sync(addressBook, options)
        .catch(function(error) {
          debug(
            'Sync address book ' + addressBook.displayName +
            ' failed with ' + error
          );
          account.addressBooks.splice(index, 1);
        });
      })
    )
    .then(function() {
      return account;
    });
  });
};

function basicSync(addressBook, options) {
  return webdav.isCollectionDirty(addressBook, options)
  .then(function(sync) {
    if (!sync) {
      debug('Local ctag matched remote! No need to sync :).');
      return addressBook;
    }

    debug('ctag changed so we need to fetch stuffs.');
    return exports.listVCards(addressBook, options)
    .then(function(objects) {
      addressBook.objects = objects;
      return addressBook;
    });
  });
}

function webdavSync(addressBook, options) {
  var req = request.syncCollection({
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'address-data', namespace: ns.CARDDAV }
    ],
    syncLevel: 1,
    syncToken: addressBook.syncToken
  });

  return options.xhr.send(req, addressBook.url, { sandbox: options.sandbox })
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
