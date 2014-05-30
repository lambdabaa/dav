var debug = require('debug')('davinci:test:xhr_test_server'),
    http = require('http'),
    url = require('url');

var server;
suiteSetup(function(done) {
  debug('Start test server.');
  server = http.createServer(function(req, res) {
    var pathname = url
      .parse(req.url)
      .pathname
      .replace('/', '');
    debug('Got request for ' + pathname);
    switch (pathname) {
      case '':
        return basic(req, res);
      case 'echo':
        return echo(req, res);
      case 'error':
        return error(req, res);
      case 'timeout':
        return timeout(req, res);
    }
  });

  server.listen(9999, '127.0.0.1', function() {
    done();
  });
});

suiteTeardown(function(done) {
  debug('Shutdown test server.');
  server.close(function() {
    done();
  });
});

function basic(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('200 OK');
}

function echo(req, res) {
  var body = '';
  req.on('data', function(data) {
    debug('Read data: ' + data);
    body += data;
  });
  req.on('end', function() {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(body);
  });
}

function error(req, res) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('500 Internal Server Error');
}

function timeout(req, res) {
  setTimeout(function() {
    basic(req, res);
  }, 100);
}
