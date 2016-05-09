'use strict';
let sinon = require('sinon');
let debug = require('debug')('helper:storage');

function Storage(opts) {
  opts = opts || {};

  debug('init', opts);

  let storage = {
    users: {
      get: sinon.stub().yields(),
      save: sinon.stub().yields(),
    },
  };

  return storage;
}

module.exports = Storage;
