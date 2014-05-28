var debug = require('debug')('davinci:server'),
    spawn = require('child_process').spawn,
    tcpPortUsed = require('tcp-port-used');

var server;

setup(function() {
  debug('Start dav server.');
  server = spawn('php', [
    '-S',
    '127.0.0.1:8888',
    'calendarserver.php'
  ], {
    cwd: __dirname + '/SabreDAV'
  });

  server.stdout.on('data', function(chunk) {
    debug(chunk.toString());
  });

  server.stderr.on('data', function(chunk) {
    debug(chunk.toString());
  });

  debug('Wait for dav server to start.');
  return tcpPortUsed.waitUntilUsed(8888, 100);
});

teardown(function() {
  debug('Wait for server to die.');
  return new Promise(function(resolve, reject) {
    server.on('exit', function() {
      debug('Server died.');
      resolve();
    });

    server.kill();
  });
});
