var Handlebars = require('handlebars'),
    XMLHttpRequest = require('./xmlhttprequest'),
    fs = require('fs');

// TODO(gareth): Simple way to make this work in the browser.
var template = Handlebars.compile(
  fs.readFileSync(__dirname + '/../templates/propfind.hbs', 'utf-8')
);

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

  var body = template({ props: options.props });
  // TODO(gareth): Parse request body.
  return request.send(body);
};
