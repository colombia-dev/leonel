'use strict';
let debug = require('debug')('bot:onboard');
let noop = () => {};

function onboard(bot, message, callback) {
  debug('begin');
  callback = callback || noop;

  let text = 'ola ke ase, bienvenid@ a colombia.dev';
  let channel = '#general';

  bot.say({ text, channel }, callback);
  debug('complete');
}

module.exports = onboard;
