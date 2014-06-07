'use strict';

var XMLHttpRequest = require('./xmlhttprequest'),
    dav = require('./dav'),
    parser = require('../parser'),
    template = require('../template');

module.exports = function(options) {
  var request = new XMLHttpRequest();
  request.sandbox = options.sandbox;
  request.open(
    'REPORT',
    options.url,
    true /* async */,
    options.username,
    options.password
  );

  dav.setRequestHeaders(request, options);

  var body = template.calendarQuery({
    props: options.props,
    filters: options.filters
  });

  return request.send(body).then(function(responseText) {
    var multistatus = parser.multistatus(responseText);
    dav.verifyMultistatus(multistatus);
    return multistatus.map(function(response) {
      return { href: response.href, props: dav.getProps(response.propstats) };
    });
  });
};
