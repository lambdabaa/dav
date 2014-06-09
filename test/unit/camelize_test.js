'use strict';

var assert = require('chai').assert,
    camelize = require('../../lib/camelize');

suite('camelize', function() {
  test('single word', function() {
    assert.strictEqual(camelize('green'), 'green');
  });

  test('multiple words', function() {
    assert.strictEqual(
      camelize('green-eggs-and-ham', '-'),
      'greenEggsAndHam'
    );
  });

  test('omit delimiter', function() {
    assert.strictEqual(
      camelize('green_eggs_and_ham'),
      'greenEggsAndHam'
    );
  });
});
