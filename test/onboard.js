'use strict';
import test from 'ava';
import onboard from '../lib/onboard';

// require test helpers
import BotHelper from './helpers/bot';
import StorageHelper from './helpers/storage';
import MessageHelper from './helpers/message';

// setup good invitation test
test.beforeEach(t => {
  // initialize helpers
  let storage = new StorageHelper();
  let bot = new BotHelper({ storage });
  let message = new MessageHelper();

  // export context
  t.context = {
    bot,
    message,
  };
});

test.cb('welcomes new user on #general', t => {
  t.plan(2);

  let { bot, message } = t.context;
  let welcomeText = 'ola ke ase, bienvenid@ a colombia.dev';
  let welcomeChannel = '#general';

  // make invitation request
  onboard(bot, message, () => {
    let sayArgs = bot.say.args[0][0];

    t.is(sayArgs.text, welcomeText, 'welcomes user');
    t.is(sayArgs.channel, welcomeChannel, 'uses right channel');
    t.end(null);
  });
});

test.todo('welcomes new user privately');
test.todo('creates new user storage');
test.todo('records date user joined');

