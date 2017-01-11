'use strict'

// = require modules
const test = require('ava')
const moment = require('moment')
const clause = require('../lib/clause')

// = require test helpers
const BotHelper = require('./helpers/bot')
const StorageHelper = require('./helpers/storage')
const MessageHelper = require('./helpers/message')

test.beforeEach(t => {
  // initialize helpers
  let storage = new StorageHelper()
  let bot = new BotHelper({ storage })
  let message = new MessageHelper({
    user: 'userID',
    match: ['clausulas', 'clausula', 'clause', 'why']
  })

  // setup user stubbed data
  let createdAt = moment().subtract(100, 'days')
  let hostData = {
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

test('it replies for clauses', t => {
  t.plan(1)

  let { bot, message } = t.context
  let reply = [
    'Si no podés invitar a tu parcero mira esto:',
    '- El servidor encontro un problema, podés tratar de nuevo pero mira lo siguiente antes :troll:',
    '- Debes de tener 45 días de ser parcero de la comunidad para invitar a alguien :beers:',
    '- Posiblemente no encontre tu usuario, acuerdate que soy coqueto :heart_eyes:',
    '- Tu parcero ya tiene una invitación pendiente por alguien más ó ya está en esta comunidad :shark:',
    '- La invitación no se envio o no funciono :troll: (Trata de nuevo)',
    '- Agotaste la cantidad de invitaciones por mes... Veo que tienes muchos parceros... miralos con `@leonel parceros` :metal:',
    'Si nada de lo que te dije es el caso, ahora si pregunta a alguien más como :buritica:'
  ].join('\n')

  return clause(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})
