'use strict'

const test = require('ava')
const onboard = require('../lib/onboard')
const sinon = require('sinon')

// require test helpers
const BotHelper = require('./helpers/bot')
const StorageHelper = require('./helpers/storage')
const MessageHelper = require('./helpers/message')

// setup good invitation test
test.beforeEach(t => {
  // initialize helpers
  const storage = new StorageHelper()
  const bot = new BotHelper({ storage })
  const message = new MessageHelper()

  // export context
  t.context = {
    bot,
    message
  }

  // message.user has a different structure in the `team_joined` event we bind to
  // so we extend it here before tests run
  message.user = {
    id: 'user123',
    name: 'buritica',
    profile: {
      real_name_normalized: 'My Name Normalized',
      email: 'buritica@gmail.com'
    },
    is_bot: false,
    is_admin: true,
    is_owner: true
  }
})

test.serial('it welcomes new user on #intros', t => {
  t.plan(2)

  const { bot, message } = t.context
  const introText = [
    `Ole <@${message.user.id}|message.user.name>, que bueno tenerte por estas tierras.`,
    'Pa romper el hielo, cuéntanos... ¿Dónde vives y a qué te dedicas?'
  ].join(' ')
  const introChannel = process.env.CHANNEL_INTROS
  const clock = sinon.useFakeTimers()

  // call onboarding
  return onboard(bot, message).then(() => {
    clock.tick(3000)
    const sayArgs = bot.say.args[0][0]

    t.is(sayArgs.text, introText, 'welcomes user')
    t.is(sayArgs.channel, introChannel, 'uses right channel')
    clock.restore()
  })
})

test('it starts a private conversation for onboarding', t => {
  t.plan(1)
  const { bot, message } = t.context

  return onboard(bot, message).then(() => {
    const user = bot.startPrivateConversation.args[0][0].user
    t.is(user, message.user.id, 'private conversation started')
  })
})

test('it welcomes new user in private conversation', t => {
  t.plan(3)

  const { bot, message } = t.context
  const jobsChannel = process.env.CHANNEL_JOBS
  const welcomeText = [
    '¡Hola! Ya que acabas de llegar por aquí te cuento unas cositas sobre colombia.dev: \n' +
    '• Somos una comunidad de personas interesadas en programación y diseño ' +
    'nacidas o residentes en :flag-co: \n' +
    '• Hay diferentes canales organizados por tema, únete a los que te interesen. \n' +
    `• <#${jobsChannel}|trabajos> es el único lugar donde se permiten ofertas o búsquedas laborales \n`,
    'Finalmente, al pertenecer a esta comunidad adoptas nuestro código de conducta ' +
    'https://github.com/colombia-dev/codigo-de-conducta/blob/master/README.md',
    'Síguenos en twitter en https://twitter.com/colombia_dev'
  ]

  // call onboarding
  return onboard(bot, message).then(() => {
    t.true(bot.conversation.say.calledWith(welcomeText[0]))
    t.true(bot.conversation.say.calledWith(welcomeText[1]))
    t.true(bot.conversation.say.calledWith(welcomeText[2]))
  })
})

test('it creates new user storage', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  // call onboarding
  return onboard(bot, message).then(() => {
    const savedID = storage.users.save.args[0][0].id
    t.is(savedID, message.user.id, 'new user storage is created')
  })
})

test('it records date user joined', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit
  const now = Date.now()
  const clock = sinon.useFakeTimers(now)

  // call onboarding
  return onboard(bot, message).then(() => {
    const savedCreatedAt = storage.users.save.args[0][0].createdAt
    t.is(savedCreatedAt.getTime(), new Date().getTime(), 'records date user joined')
    clock.restore()
  })
})

test('it records user name', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].name, message.user.name, 'records user name')
  })
})

test('it records user real name', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].real_name, message.user.profile.real_name_normalized, 'records real user name')
  })
})

test('it records user email', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].email, message.user.profile.email, 'records user email')
  })
})

test('it records slack user state', t => {
  t.plan(3)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].is_admin, message.user.is_admin, 'records is admin')
    t.is(storage.users.save.args[0][0].is_owner, message.user.is_owner, 'records is owner')
    t.is(storage.users.save.args[0][0].is_bot, message.user.is_bot, 'records is bot')
  })
})

test('it records empty guests', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].guests.length, 0, 'records empty guests')
  })
})

test('it assigns 1 invite', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  // call onboarding
  return onboard(bot, message).then(() => {
    t.is(storage.users.save.args[0][0].invites, 1, 'assings invite')
  })
})
