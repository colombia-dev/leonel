'use strict';
let sinon = require('sinon');
let debug = require('debug')('helper:bot');

function Bot(opts) {
  opts = opts || {};

  debug('init', opts);
  let storage = opts.storage || {};

  return {
    reply: sinon.stub().callsArg(2),
    say: sinon.stub().callsArg(1),
    botkit: {
      storage,
    },
  };
}

module.exports = Bot;
