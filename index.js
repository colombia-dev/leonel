'use strict'

const config = require('./lib/config')
const checkConfig = require('./lib/check-config')
checkConfig(config, ['SLACK_TOKEN', 'SLACK_ADMIN_TOKEN', 'SLACK_TEAM_NAME', 'DEBUG', 'MONGO_URI', 'CHANNEL_INTROS'])

const Botkit = require('botkit')
const invite = require('./lib/invite')
const onboard = require('./lib/onboard')
const guests = require('./lib/guests')
const coinPrice = require('./lib/coinPrice')
const coinMiddleware = require('./middlewares/coinMiddleware')
const storage = require('botkit-storage-mongo')({ mongoUri: config.MONGO_URI })
const debug = require('debug')('bot:main')
const packageInfo = require('./package.json')
const { giveInvites } = require('./cron/giveInvites')

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
  retry: 10,
  token: slackToken
})

bot.startRTM((err, bot, payload) => {
  if (err) { throw new Error('Could not connect to Slack') }
  debug('Estamos coneptados al Eslá')
  giveInvites(bot)
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

// force invites to come through DM
controller.hears('invite', 'direct_mention', (bot, message) => {
  bot.reply(message, 'Invitaciones por DM por favor :soccer:')
})

/**
 * List of people I have invited
 */
const myGuests = ['invitados', 'amiguis', 'amigas', 'amigos', 'parceros']
controller.hears(myGuests, 'direct_message', guests)

// force guest list requests to come through DMs
controller.hears(myGuests, 'direct_mention', (bot, message) => {
  bot.reply(message, 'Pideme tu lista de invitados por DM por favor :soccer:')
})

/**
 * Private Onboarding
 * for testing you can subscribe to `user_change` and modify your own profile
 * so an event with the same info fires, since we don't have a way to simulate
 * slack events easily right now
 */
controller.on('team_join', onboard)

/**
 * Help
 */
controller.hears(['help', 'ayuda'], ['direct_message', 'direct_mention'], (bot, message) => {
  const help = [
    `Yo respondo a:
    - \`/dm @leonel invite a me@example.com\` para enviar una invitación a este Slack.
    - \`/dm @leonel amiguis\` para saber a quien has invitado.
    - \`/dm @leonel a cuanto esta (BTC|BCH|ETH|LTC|XRP|ADA|IOT|XEM|XLM|DASH)\` para saber el precio actual de las monedas.
    - \`@leonel ayuda/help\` para ver este mensaje.
    ... y me podés estender en ${packageInfo.homepage}`
  ].join('\n')
  bot.reply(message, help)
})

/**
 * Repo
 */
controller.hears('repo', ['direct_mention', 'direct_message'], (bot, message) => {
  bot.reply(message, `🏡 ${packageInfo.homepage}`)
})

/**
 * Channel Debugging
 */
controller.hears('test', ['direct_mention', 'direct_message'], (bot, message) => {
  debug('message', JSON.stringify(message, null, 2))
  bot.reply(message, '¡Listo papito! Si, es ya es ¡Ya!')
})

/**
 * Crypto Currency price
 */
controller.hears('*', ['direct_metion', 'direct_message'], coinMiddleware, coinPrice)

/**
 * Uncaught Messages
 */
controller.hears('.*', ['direct_message', 'direct_mention'], (bot, message) => {
  debug('not caught', JSON.stringify(message, null, 2))
})
