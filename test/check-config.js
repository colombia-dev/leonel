'use strict';

// = require modules
const test = require('ava');
const checkConfig = require('../lib/check-config');

test('throws an error if there are missing config variables', t => {

  try {
    checkConfig({
      EXISTING_CONFIG_VAR: 1,
      NULL_CONFIG_VAR: null,
    }, ['MISSING_CONFIG_VAR', 'NULL_CONFIG_VAR']);
    t.fail();
  } catch (e) {
    t.is(e.message, 'Missing configuration variables: MISSING_CONFIG_VAR, NULL_CONFIG_VAR');
    t.pass();
  }

});
