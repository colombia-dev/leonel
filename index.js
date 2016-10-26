'use strict'

const config = require('./lib/config')
const checkConfig = require('./lib/check-config')
checkConfig(config, ['SLACK_TOKEN', 'SLACK_ADMIN_TOKEN', 'SLACK_TEAM_NAME', 'DEBUG', 'MONGO_URI', 'CHANNEL_INTROS'])

const Botkit = require('botkit')
const invite = require('./lib/invite')
const onboard = require('./lib/onboard')
const guests = require('./lib/guests')
const storage = require('botkit-storage-mongo')({ mongoUri: config.MONGO_URI })
const debug = require('debug')('bot:main')
const packageInfo = require('./package.json')

// Expect a SLACK_TOKEN environment variable
let slackToken = config.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

let controller = Botkit.slackbot({
  storage: storage
})

let bot = controller.spawn({
  token: slackToken
})

bot.startRTM((err, bot, payload) => {
  if (err) { throw new Error('Could not connect to Slack') }
})

controller.on('bot_channel_join', (bot, message) => {
  bot.reply(message, '¡Listo papito, si es ya, es ya!')
})

/**
 * Coqueto ;)
 */
controller.hears(['coqueto'], ['direct_mention', 'direct_message'], (bot, message) => {
  bot.reply(
    message,
    'Yo no soy coqueto... soy un tierno. https://www.youtube.com/watch?v=sFpdl0EiLkA&feature=youtu.be&t=223'
  )
})

/**
 * Invitations
 */
controller.hears('invite a <mailto:(.*)\\|.*>', 'direct_message', invite)

controller.hears('invite', 'direct_mention', (bot, message) => {
  bot.reply(message, 'Invitaciones por DM por favor :soccer:')
})

/**
 * Private Onboarding
 * for testing you can subscribe to `user_change` and modify your own profile
 * so an event with the same info fires, since we don't have a way to simulate
 * slack events easily right now
 */
controller.on('team_join', onboard)

/**
 * Invited guests
 */
controller.hears(['parceros', 'llaverias', 'neas', 'ñeros', 'invitados'], 'direct_message', guests)

/**
 * Help
 */
controller.hears(['help', 'ayuda'], ['direct_message', 'direct_mention'], (bot, message) => {
  let help = [
    'Yo respondo a:',
    '- `/dm @leonel invite a me@example.com` para enviar una invitación a este Slack.',
    '- `@leonel ayuda/help` para ver este mensaje.',
    '- `@leonel coqueto` por que así soy yo',
    '- mira `@leonel clausulas` si no podés invitar a tu parcero.',
    `... y me podés estender en ${packageInfo.homepage}`
  ].join('\n')
  bot.reply(message, help)
})

/**
 * Clausulas
 */
controller.hears(['clausulas', 'clausulas', 'clause', 'why'], ['direct_message', 'direct_mention'], (bot, message) => {
  let clause = [
    'Si no podés invitar a tu parcero mira esto:',
    '- El servidor encontro un problema, podés tratar de nuevo pero mira lo siguiente antes :troll:',
    '- Debes de tener 45 días de ser parcero de la comunidad para invitar a alguien :beers:',
    '- Posiblemente no encontre tu usuario, acuerdate que soy coqueto :heart_eyes:',
    '- Tu parcero ya tiene una invitación pendiente por alguien más ó ya está en esta comunidad :shark:',
    '- La invitación no se envio o no funciono :troll: (Trata de nuevo)',
    '- Agotaste la cantidad de invitaciones por mes... Veo que tienes muchos parceros... miralos con `@leonel parceros` :metal:',
    'Si nada de lo que te dije es el caso, ahora si pregunta a alguien más como :buritica:'
  ].join('\n')
  bot.reply(message, clause)
})

/**
 * BairesDev
 */
controller.hears(['baires', 'bairesdev', 'BairesDev', 'bairesDev'], ['direct_message', 'direct_mention'], (bot, message) => {
  let bairesdev = [
    '¿Me preguntas por BairesDev?, esto es lo que yo se:',
    '- Tienen un bot de Spamming (Que nunca arreglan) :troll:',
    '- Son falta de respuesta.',
    '- Tenemos algunos parceros que han trabajado con ellos y aunque tienen una `buena experiencia` con ellos recibimos una mayor cantidad de quejas sobre ellos. :imp:'
  ].join('\n')
  bot.reply(message, bairesdev)
})

/**
 * Channel Debugging
 */
controller.hears('test', ['direct_mention', 'direct_message'], (bot, message) => {
  debug('message', JSON.stringify(message, null, 2))
  bot.reply(message, 'testing')
})

/**
 * Uncaught Messages
 */
controller.hears('.*', ['direct_message', 'direct_mention'], (bot, message) => {
  debug('not caught', JSON.stringify(message, null, 2))
})
