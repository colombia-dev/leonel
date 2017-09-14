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
  t.plan(3)

  const { bot, message } = t.context
  const reply = 'BTC = 3233.51'

  // make coin request
  return coinPrice(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})
