'use strict';

var debug = require('debug')('davinci:server'),
    format = require('util').format,
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    tcpPortUsed = require('tcp-port-used');

var data = {
  principaluri: 'principals/admin',
  displayname: 'default calendar',
  uri: 'default',
  description: 'administrator calendar',
  components: 'VEVENT,VTODO',
  transparent: '0'
};

var columns = [],
    values = [];
for (var column in data) {
  var value = data[column];
  columns.push(column);
  values.push('\'' + value + '\'');
}

var insert = format(
  'echo "INSERT INTO calendars (%s) VALUES (%s);" | sqlite3 data/db.sqlite',
  columns.join(','),
  values.join(',')
);

[
  'rm -rf data/',
  'mkdir data/',
  'chmod -R a+rw data/',
  'cat examples/sql/sqlite.* | sqlite3 data/db.sqlite',
  insert
].forEach(function(command) {
  debug('exec: ' + command);
  setup(function(done) {
    exec(command, { cwd: __dirname + '/SabreDAV' }, function() { done(); });
  });
});

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
  return new Promise(function(resolve) {
    server.on('exit', function() {
      debug('Server died.');
      resolve();
    });

    server.kill();
  });
});

[
  'rm -rf data/'
].forEach(function(command) {
  teardown(function(done) {
    exec(command, { cwd: __dirname }, function() { done(); });
  });
});
