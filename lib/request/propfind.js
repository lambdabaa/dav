var Handlebars = require('handlebars'),
    Xhr = require('./xhr'),
    fs = require('fs');

// TODO(gareth): Simple way to make this work in the browser.
var template = Handlebars.compile(
  fs.readFileSync(__dirname + '/../templates/propfind.hbs', 'utf-8')
);

module.exports = function(options) {
  var xhr = new Xhr({
    method: 'PROPFIND',
    url: options.url,
    username: options.username,
    password: options.password,
    sandbox: options.sandbox
  });

  xhr.body = template({ props: options.props });
  return xhr;
};
