'use strict'

const Promise = require('bluebird')
const debug = require('debug')('bot:guests')
const logError = require('debug')('bot:error')
const _ = require('lodash')

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
  let response = ['*Tus invitados:*']
  const realGuests = _(guests).filter({result: 'ok'}).map('guest').value()
  const alreadyInvited = _(guests).filter({result: 'already_invited'}).map('guest').value()
  const alreadyInTeam = _(guests).filter({result: 'already_in_team'}).map('guest').value()

  realGuests.forEach(guest => response.push(`  - ${guest}`))

  if (alreadyInvited.length > 0) {
    response.push('', '*Estas personas ya habian sido invitadas:*')
    alreadyInvited.forEach(guest => response.push(`  - ${guest}`))
  }

  if (alreadyInTeam.length > 0) {
    response.push('', '*Estas personas ya estaban en este Slack al invitarlas:*')
    alreadyInTeam.forEach(guest => response.push(`  - ${guest}`))
  }

  return response.join('\n')
}

module.exports = guests
