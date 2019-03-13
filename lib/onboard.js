'use strict'

const debug = require('debug')('bot:onboard')
const Promise = require('bluebird')
const config = require('./config')

function onboard (bot, message) {
  debug('begin %s', message.user.name, message.user.profile.email)

  let introChannel = config.CHANNEL_INTROS
  let jobsChannel = config.CHANNEL_JOBS
  let user = message.user
  let saveData = Promise.promisify(bot.botkit.storage.users.save)
  let introText = [
    `Ole <@${message.user.id}|message.user.name>, que bueno tenerte por estas tierras.`,
    'Pa romper el hielo, cuéntanos... Tu experiencia, En que proyectos estas?, que servicios/productos quieres promoveer?'
  ].join(' ')

  setTimeout(() => {
    bot.say({ text: introText, channel: introChannel })
  }, 3000)

  bot.startPrivateConversation({ user: user.id }, function (err, convo) {
    if (err) {
      throw err
    }
    convo.say(
      '¡Hola! Ya que acabas de llegar por aquí te cuento unas cositas sobre Red Emprendimiento Med: \n' +
      '• Somos una comunidad de personas interesadas en Emprendimiento ' +
      'nacidas o residentes en Colombia \n' +
      '• Hay diferentes canales organizados por tema, únete a los que te interesen. \n'
    )
  })

  debug('complete')

  return saveData({
    id: user.id,
    name: user.name,
    real_name: user.profile.real_name_normalized,
    email: user.profile.email,
    guests: [],
    invites: 1,
    createdAt: new Date(),
    is_admin: user.is_admin,
    is_owner: user.is_owner,
    is_bot: user.is_bot
  })
}

module.exports = onboard
