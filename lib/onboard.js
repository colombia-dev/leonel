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
    'Pa romper el hielo, cuéntanos... ¿Dónde vives y a qué te dedicas?'
  ].join(' ')

  setTimeout(() => {
    bot.say({ text: introText, channel: introChannel })
  }, 3000)

  bot.startPrivateConversation({ user: user.id }, function (err, convo) {
    if (err) {
      throw err
    }
    convo.say(
      '¡Hola! Ya que acabas de llegar por aquí te cuento unas cositas sobre colombia.dev: \n' +
      '• Somos una comunidad de personas interesadas en programación y diseño ' +
      'nacidas o residentes en :flag-co: \n' +
      '• Hay diferentes canales organizados por tema, únete a los que te interesen. \n' +
      `• <#${jobsChannel}|trabajos> es el único lugar donde se permiten ofertas o búsquedas laborales \n`
    )
    convo.say(
      'Finalmente, al pertenecer a esta comunidad adoptas nuestro código de conducta ' +
      'https://github.com/colombia-dev/codigo-de-conducta/blob/master/README.md'
    )
    convo.say('Síguenos en twitter en https://twitter.com/colombia_dev')
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
