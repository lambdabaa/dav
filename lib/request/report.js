var XMLHttpRequest = require('./xmlhttprequest'),
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

  /* Headers */
  request.setRequestHeader('Content-Type', 'application/xml; charset=utf-8');
  if ('depth' in options) {
    request.setRequestHeader('Depth', options.depth);
  }
  if ('prefer' in options) {
    request.setRequestHeader('Prefer', options.prefer);
  }

  var body = template.calendarquery({
    props: options.props,
    filters: options.filters
  });
  return request
    .send(body)
    .then(function(responseText) {
      return Promise.resolve(parser.multistatus(responseText));
    })
    .then(function(response) {
      // TODO(gareth)
    });
};
