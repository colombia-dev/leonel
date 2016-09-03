'use strict';

// = require modules
const test = require('ava');
const moment = require('moment');
const guests = require('../lib/guests');

// = require test helpers
const BotHelper = require('./helpers/bot');
const StorageHelper = require('./helpers/storage');
const MessageHelper = require('./helpers/message');

test.beforeEach(t => {
  // initialize helpers
  let storage = new StorageHelper();
  let bot = new BotHelper({ storage });
  let message = new MessageHelper({
    user: 'userID',
    match: ['invitados', 'mis parceros'],
  });

  // setup user stubbed data
  let createdAt = moment().subtract(100, 'days');
  let hostData = {
    id: message.user,
    createdAt,
  };

  storage.users.get.callsArgWith(1, null, hostData);

  // export context
  t.context = {
    bot,
    message,
    hostData,
  };

});

test('it replies when user has not guests', t => {
  t.plan(1);

  let { bot, message } = t.context;
  let { storage } = bot.botkit;
  let reply = 'Oiga, invitá un parcero primero!';

  let hostData = {
    guests: [],
  };

  storage.users.get.callsArgWith(1, null, hostData);

  return guests(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied');
  });
});

test('it replies when user has not active guests', t => {
  t.plan(1);

  let { bot, message } = t.context;
  let { storage } = bot.botkit;
  let reply = 'No hay parceros activos, invitá uno ome!';

  let hostData = {
    guests: [{ guest: 'previous@gmail.com', result: 'already_invited' }],
  };

  storage.users.get.callsArgWith(1, null, hostData);

  return guests(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied');
  });
});

test('it replies when user has active guests', t => {
  t.plan(1);

  let { bot, message } = t.context;
  let { storage } = bot.botkit;
  let activeGuests = [
    { guest: 'previous@gmail.com', result: 'ok' },
    { guest: 'foo@gmail.com', result: 'ok' },
  ];
  let reply = [
    'Tus parceros:',
    '\n',
    `${activeGuests.map((guest) => guest.guest).join('\n')}`,
  ].join(' ');

  let hostData = {
    guests: activeGuests,
  };

  storage.users.get.callsArgWith(1, null, hostData);

  return guests(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied');
  });
});
