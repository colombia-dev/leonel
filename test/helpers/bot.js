'use strict';
let sinon = require('sinon');
let debug = require('debug')('helper:bot');
let noop = () => {};

function say(opts, cb) {
  debug('say');
  cb = cb || noop;
  cb(null);
}

function reply(message, content, cb) {
  debug('reply');
  cb = cb || noop;
  cb(null);
}

function Bot(opts) {
  opts = opts || {};

  debug('init', opts);
  let storage = opts.storage || {};
  let bot = {
    reply,
    say,
    botkit: {
      storage,
    },
  };

  sinon.spy(bot, 'reply');
  sinon.spy(bot, 'say');

  return bot;
}

module.exports = Bot;
