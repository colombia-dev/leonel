'use strict';

const test = require('ava');
const onboard = require('../lib/onboard');
const sinon = require('sinon');

// require test helpers
const BotHelper = require('./helpers/bot');
const StorageHelper = require('./helpers/storage');
const MessageHelper = require('./helpers/message');

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

  // message.user has a different structure in the `team_joined` event we bind to
  // so we extend it here before tests run
  message.user = {
    id: 'user123',
    name: 'buritica',
  };

});

test.serial('it welcomes new user on #intros', t => {
  t.plan(2);

  let { bot, message } = t.context;
  let introText = [
    `Ole <@${message.user.id}|message.user.name>, que bueno tenerte por estas tierras.`,
    'Pa romper el hielo, cuéntanos... ¿Dónde vives y a qué te dedicas?',
  ].join(' ');
  let introChannel = process.env.CHANNEL_INTROS;
  let clock = sinon.useFakeTimers();

  // call onboarding
  return onboard(bot, message).then(() => {
    clock.tick(3000);
    let sayArgs = bot.say.args[0][0];

    t.is(sayArgs.text, introText, 'welcomes user');
    t.is(sayArgs.channel, introChannel, 'uses right channel');
    clock.restore();
  });
});

test('it starts a private conversation for onboarding', t => {
  t.plan(1);
  let { bot, message } = t.context;

  return onboard(bot, message).then(() => {
    let user = bot.startPrivateConversation.args[0][0].user;
    t.is(user, message.user.id, 'private conversation started');
  });
});

test('it welcomes new user in private conversation', t => {
  t.plan(2);

  let { bot, message } = t.context;
  let jobsChannel = process.env.CHANNEL_JOBS;
  let welcomeText = [
    '¡Hola! Ya que acabas de llegar por aquí te cuento unas cositas sobre colombia.dev: \n' +
    '• Somos una comunidad de personas interesadas en programación y diseño ' +
    'nacidas o residentes en :flag-co: \n' +
    '• Hay diferentes canales organizados por tema, únete a los que te interesen. \n' +
    `• <#${jobsChannel}|trabajos> es el único lugar donde se permiten ofertas o búsquedas laborales \n`,
    'Finalmente, al pertenecer a esta comunidad adoptas nuestro código de conducta' +
    'https://github.com/colombia-dev/codigo-de-conducta/blob/master/README.md',
  ];

  // call onboarding
  return onboard(bot, message).then(() => {
    t.true(bot.conversation.say.calledWith(welcomeText[0]), welcomeText[0]);
    t.true(bot.conversation.say.calledWith(welcomeText[1]), welcomeText[0]);
  });
});

test('it creates new user storage', t => {
  t.plan(1);

  let { bot, message } = t.context;
  let { storage } = bot.botkit;

  // call onboarding
  return onboard(bot, message).then(() => {
    let savedID = storage.users.save.args[0][0].id;
    t.is(savedID, message.user.id, `new user storage is created`);
  });
});

test('it records date user joined', t => {
  t.plan(1);

  let { bot, message } = t.context;
  let { storage } = bot.botkit;
  let now = Date.now();
  let clock = sinon.useFakeTimers(now);

  // call onboarding
  return onboard(bot, message).then(() => {
    let savedCreatedAt = storage.users.save.args[0][0].createdAt;
    t.is(savedCreatedAt.getTime(), new Date().getTime(), 'records date user joined');
    clock.restore();
  });
});

test('it records user name', t => {
  t.plan(1);

  let { bot, message } = t.context;
  let { storage } = bot.botkit;

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].name, 'buritica', 'records user name');
  });
});

test('it assigns 3 invites', t => {
  t.plan(1);

  let { bot, message } = t.context;
  let { storage } = bot.botkit;

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].invites, 3, 'records user name');
  });
});
