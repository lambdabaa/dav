'use strict';
var XMLHttpRequest = require('./xmlhttprequest'),
    parser = require('../parser'),
    template = require('../template');

module.exports = function(options) {
  var request = new XMLHttpRequest();
  request.sandbox = options.sandbox;
  request.open(
    'PROPFIND',
    options.url,
    true /* async */,
    options.username,
    options.password
  );

  /* Headers */
  request.setRequestHeader('Content-Type', 'application/xml; charset=utf-8');
  if ('depth' in options) {
    request.setRequestHeader('Depth', options.depth);
  }
  if ('prefer' in options) {
    request.setRequestHeader('Prefer', options.prefer);
  }

  var body = template.propfind({ props: options.props });
  return request
    .send(body)
    .then(function(responseText) {
      return Promise.resolve(parser.multistatus(responseText));
    })
    .then(function(response) {
      if (!('propstats' in response) || !(response.propstats.length)) {
        throw new Error('response missing propstats!');
      }

      return response.propstats.map(function(propstat) {
        if (!/2\d{2}/g.test(propstat.status)) {
          throw new Error('Bad status from propstat: ' + propstat.status);
        }
        if (!('prop' in propstat) || typeof(propstat.prop) !== 'object') {
          throw new Error('propstat missing prop!');
        }

        return propstat.prop;
      });
    });
};
