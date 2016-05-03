'use strict';
let sinon = require('sinon');
let debug = require('debug')('helper:storage');

function Storage(opts) {
  opts = opts || {};

  debug('init', opts);

  return {
    users: {
      // get data is empty by default
      get: sinon.stub().callsArgWith(1, null, null),
      save: sinon.stub().callsArg(1),
    },
  };
}

module.exports = Storage;
