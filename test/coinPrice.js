'use strict'

// = require modules
const test = require('ava')
const coinPrice = require('../lib/coinPrice')

// = require test helpers
const BotHelper = require('./helpers/bot')
const StorageHelper = require('./helpers/storage')
const MessageHelper = require('./helpers/message')

test.beforeEach(t => {
  const storage = new StorageHelper()
  // initialize helpers
  const bot = new BotHelper({ storage })
  const message = new MessageHelper({
    user: 'userID',
    text: 'Cual es el precio del BTC'
  })

  // export context
  t.context = {
    bot,
    message
  }
})

test('it returns the actual price of the selected coin', (t) => {
  t.plan(1)

  const { bot, message } = t.context
  const reply = '*BTC ='

  // make coin request
  return coinPrice(bot, message).then(() => {
    t.is(bot.reply.args[0][1].slice(0, 6), reply, 'bot replied')
  })
})
