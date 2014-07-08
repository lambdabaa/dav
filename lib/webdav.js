'use strict';

var debug = require('debug')('dav:webdav'),
    ns = require('./namespace'),
    request = require('./request');

/**
 * @param {String} objectUrl url for webdav object.
 * @param {String} objectData webdav object data.
 */
exports.createObject = function(objectUrl, objectData, options) {
  var req = request.basic({ method: 'PUT', data: objectData });
  return options.xhr.send(req, objectUrl, { sandbox: options.sandbox });
};

exports.updateObject = function(objectUrl, objectData, etag, options) {
  var req = request.basic({ method: 'PUT', data: objectData, etag: etag });
  return options.xhr.send(req, objectUrl, { sandbox: options.sandbox });
};

exports.deleteObject = function(objectUrl, etag, options) {
  var req = request.basic({ method: 'DELETE', etag: etag });
  return options.xhr.send(req, objectUrl, { sandbox: options.sandbox });
};

exports.syncCollection = function(collection, options) {
  var syncMethod;
  if ('syncMethod' in options) {
    syncMethod = options.syncMethod;
  } else if (collection.reports &&
             collection.reports.indexOf('syncCollection') !== -1) {
    syncMethod = 'webdav';
  } else {
    syncMethod = 'basic';
  }

  if (syncMethod === 'webdav') {
    debug('rfc 6578 sync.');
    return options.webdavSync(collection, options);
  } else {
    debug('basic sync.');
    return options.basicSync(collection, options);
  }
};

/**
 * @param {dav.DAVCollection} collection to fetch report set for.
 */
exports.supportedReportSet = function(collection, options) {
  debug('Checking supported report set for collection at ' + collection.url);
  var req = request.propfind({
    props: [ { name: 'supported-report-set', namespace: ns.DAV } ],
    depth: 1,
    mergeResponses: true
  });

  return options.xhr.send(req, collection.url, { sandbox: options.sandbox })
  .then(function(response) {
    return response.props.supportedReportSet;
  });
};

exports.isCollectionDirty = function(collection, options) {
  return new Promise(function(resolve, reject) {
    if (!collection.ctag) {
      debug('Missing ctag.');
      return resolve(false);
    }

    debug('Fetch remote getctag prop.');

    var req = request.propfind({
      props: [ { name: 'getctag', namespace: ns.CALENDAR_SERVER } ],
      depth: 0
    });

    return options.xhr.send(req, collection.account.homeUrl, {
      sandbox: options.sandbox
    })
    .then(function(responses) {
      var response = responses.filter(function(response) {
        // Find the response that corresponds to the parameter collection.
        return collection.url.indexOf(response.href !== -1);
      })[0];

      if (!response) {
        return reject(
          new Error('Could not find collection on remote. Was it deleted?')
        );
      }

      debug('Check whether cached ctag matches remote.');
      return resolve(collection.ctag !== response.props.getctag);
    });
  });
};
