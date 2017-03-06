'use strict'

const Promise = require('bluebird')
const debug = require('debug')('bot:clause')
const logError = require('debug')('bot:error')

function clause (bot, message) {
  debug('begin')
  let user = message.user
  let getData = Promise.promisify(bot.botkit.storage.users.get)

  return getData(user)
    .then((data) => {
      debug('clause', data)

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

      return bot.reply(message, reply)
    })
    .catch(err => {
      logError('caught', err)
      return bot.reply(message, 'Error - servidor falló')
    })
}

module.exports = clause
