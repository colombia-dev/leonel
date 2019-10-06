'use strict'

// = require modules
const test = require('ava')
const moment = require('moment')
const guests = require('../lib/guests')

// = require test helpers
const BotHelper = require('./helpers/bot')
const StorageHelper = require('./helpers/storage')
const MessageHelper = require('./helpers/message')

test.beforeEach(t => {
  // initialize helpers
  const storage = new StorageHelper()
  const bot = new BotHelper({ storage })
  const message = new MessageHelper({
    user: 'userID',
    match: ['invitados', 'amiguis', 'amigas', 'amigos', 'parceros']
  })

  // setup user stubbed data
  const createdAt = moment().subtract(100, 'days')
  const hostData = {
    id: message.user,
    createdAt
  }

  storage.users.get.callsArgWith(1, null, hostData)

  // export context
  t.context = {
    bot,
    message,
    hostData
  }
})

test('it replies when user has no guests', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit
  const reply = 'Oe, invitá un parcero primero!'

  const hostData = {
    guests: []
  }

  storage.users.get.callsArgWith(1, null, hostData)

  return guests(bot, message)
    .then(() => t.is(bot.reply.args[0][1], reply, 'bot replied'))
})

test('it shows succesful guests', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  const reply =
`*Tus invitados:*
  - ok@gmail.com
  - ok2@gmail.com`

  const hostData = {
    guests: [
      { guest: 'ok@gmail.com', result: 'ok' },
      { guest: 'ok2@gmail.com', result: 'ok' }
    ]
  }

  storage.users.get.callsArgWith(1, null, hostData)

  return guests(bot, message)
    .then(() => t.is(bot.reply.args[0][1], reply, 'bot replied'))
})

test('it shows a guest that has already been invited', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  const reply =
`*Tus invitados:*
  - ok@gmail.com
  - ok2@gmail.com

*Estas personas ya habian sido invitadas:*
  - already@gmail.com`

  const hostData = {
    guests: [
      { guest: 'ok@gmail.com', result: 'ok' },
      { guest: 'ok2@gmail.com', result: 'ok' },
      { guest: 'already@gmail.com', result: 'already_invited' }
    ]
  }

  storage.users.get.callsArgWith(1, null, hostData)

  return guests(bot, message)
    .then(() => t.is(bot.reply.args[0][1], reply, 'bot replied'))
})

test('it shows a guest that already had an account in this team', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit

  const reply =
`*Tus invitados:*
  - ok@gmail.com
  - ok2@gmail.com

*Estas personas ya habian sido invitadas:*
  - already@gmail.com

*Estas personas ya estaban en este Slack al invitarlas:*
  - inteam@gmail.com`

  const hostData = {
    guests: [
      { guest: 'ok@gmail.com', result: 'ok' },
      { guest: 'ok2@gmail.com', result: 'ok' },
      { guest: 'already@gmail.com', result: 'already_invited' },
      { guest: 'inteam@gmail.com', result: 'already_in_team' }
    ]
  }

  storage.users.get.callsArgWith(1, null, hostData)

  return guests(bot, message)
    .then(() => t.is(bot.reply.args[0][1], reply, 'bot replied'))
})

test('it replies with error message if something along flow errors', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit
  const reply = 'Error - servidor falló'

  // force database failure
  storage.users.get.callsArgWith(1, new Error('fake db failure'), {})

  // make invitation request
  return guests(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'called with text')
  })
})
