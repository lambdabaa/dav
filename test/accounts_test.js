suite('accounts', function() {
  var subject = require('../lib/accounts');

  suite('#create', function() {
    var result;

    setup(function() {
      return subject.create({
        username: 'CHANGE ME',
        password: 'CHANGE ME',
        server: 'CHANGE ME'
      })
      .then(function(response) {
        result = response;
      });
    });

    test.skip('w/ service discovery', function() {
      // TODO(gareth)
    });

    test.skip('w/o service discovery', function() {
      // TODO(gareth)
    });
  });
})
