var DOMParser = typeof(window) !== 'undefined' ?
  window.DOMParser :
  require('xmldom').DOMParser;

var XMLHttpRequest = require('./xmlhttprequest'),
    fs = require('fs'),
    parser = require('../parser'),
    template = require('../template');

module.exports = function(options) {
  var request = new XMLHttpRequest();
  request.sandbox = options.sandbox;
  request.open(
    'PROPFIND',
    options.url,
    true,
    options.username,
    options.password
  );

  if ('depth' in options) {
    request.setRequestHeader('Depth', options.depth);
  }

  var body = template.propfind({ props: options.props });
  return request
    .send(body)
    .then(function(responseText) {
      return Promise.resolve(parser.propfind(responseText));
    });
};
