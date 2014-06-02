var assert = require('assert'),
    helpers = require('../../../lib/template/helpers');

suite('Handlebars helpers', function() {
  test.skip('filter', function() {
  });

  suite('prop', function() {
    test('DAV', function() {
      var prop = helpers
        .propHelper({
          name: 'catdog',
          namespace: 'DAV'
        }, 'D')
        .string;

      assert.strictEqual(prop, '<D:catdog />');
    });

    test('arbitrary ns', function() {
      var prop = helpers
        .propHelper({
          name: 'spongebob',
          namespace: 'c'
        }, 'D')
        .string;

      assert.strictEqual(prop, '<c:spongebob />');
    });
  });
});
