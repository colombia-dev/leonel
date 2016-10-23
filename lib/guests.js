'use strict'

const Promise = require('bluebird')
const debug = require('debug')('bot:guests')
const logError = require('debug')('bot:error')

function guests (bot, message) {
  debug('begin')
  let user = message.user
  let getData = Promise.promisify(bot.botkit.storage.users.get)

  return getData(user)
    .then((data) => {
      debug('pana', data)
      debug('panas', data.guests)

      if (data.guests.length === 0) {
        return bot.reply(message, 'Oe, invitá un parcero primero!')
      }

      return bot.reply(message, formatOutput(data.guests))
    })
    .catch(err => {
      logError('caught', err)
      return bot.reply(message, 'Error - servidor falló')
    })
}

function formatOutput (guests) {
  let guestsInviteResults = {
    ok: 'Invitado',
    already_invited: 'Ya se invitó',
    already_in_team: 'Ya está registrado'
  }

  return [
    'Tus parceros:',
    '\n',
    `${guests.map((guest) => `${guest.guest}: ${guestsInviteResults[guest.result] || guest.result}`).join('\n')}`
  ].join(' ')
}

module.exports = guests
