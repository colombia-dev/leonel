'use strict';
let sinon = require('sinon');
let debug = require('debug')('helper:bot');

function Bot(opts) {
  debug('init', opts);
  let storage = opts.storage || {};

  return {
    reply: sinon.stub().callsArg(2),
    botkit: {
      storage,
    },
  };
}

module.exports = Bot;
