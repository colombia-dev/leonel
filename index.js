'use strict';

const config = require('./lib/config');
const checkConfig = require('./lib/check-config');
checkConfig(config, ['SLACK_TOKEN', 'SLACK_ADMIN_TOKEN', 'SLACK_TEAM_NAME', 'DEBUG', 'MONGO_URI', 'CHANNEL_INTROS']);

const Botkit = require('botkit');
const invite = require('./lib/invite');
const onboard = require('./lib/onboard');
const storage = require('botkit-storage-mongo')({ mongoUri: config.MONGO_URI });
const debug = require('debug')('bot:main');
const packageInfo = require('./package.json');

// Expect a SLACK_TOKEN environment variable
let slackToken = config.SLACK_TOKEN;
if (!slackToken) {
  console.error('SLACK_TOKEN is required!');
  process.exit(1);
}

let controller = Botkit.slackbot({
  storage: storage,
});

let bot = controller.spawn({
  token: slackToken,
});

bot.startRTM((err, bot, payload) => {
  if (err) { throw new Error('Could not connect to Slack'); }
});

controller.on('bot_channel_join', (bot, message) => {
  bot.reply(message, '¡Listo papito, si es ya, es ya!');
});

/**
 * Coqueto ;)
 */
controller.hears(['coqueto'], ['direct_mention', 'direct_message'], (bot, message) => {
  bot.reply(
    message,
    'Yo no soy coqueto... soy un tierno. https://www.youtube.com/watch?v=sFpdl0EiLkA&feature=youtu.be&t=223'
  );
});

/**
 * Invitations
 */
controller.hears('invite a <mailto:(.*)\\|.*>', 'direct_message', invite);

controller.hears('invite', 'direct_mention', (bot, message) => {
  bot.reply(message, 'Invitaciones por DM por favor :soccer:');
});

/**
 * Private Onboarding
 * for testing you can subscribe to `user_change` and modify your own profile
 * so an event with the same info fires, since we don't have a way to simulate
 * slack events easily right now
 */
controller.on('team_join', onboard);

/**
 * Help
 */
controller.hears(['help', 'ayuda'], ['direct_message', 'direct_mention'], (bot, message) => {
  let help = [
    'Yo respondo a:',
    '- `/dm @leonel invite a me@example.com` para enviar una invitación a este Slack.',
    '- `@leonel ayuda/help` para ver este mensaje.',
    `... y me podés estender en ${packageInfo.homepage}`,
  ].join('\n');
  bot.reply(message, help);
});

/**
 * Baires Dev explanation
 */
controller.hears(['Baires', 'BairesDev', 'baires', 'bairesdev'], ['direct_message', 'direct_mention'], (bot, message) => {
  let bairesResponse = [
    'Existen opiniones generales acerca de la empresa, dentro de las cuales se incluyen:',
    '- Spam generado con multiples ofertas laborales a las cuales rara vez dan respuesta.',
    '- Pocas personas han estado trabajando con ellos.',
    '- Algunas personas han iniciado proceso de selección pero tardan mucho las respuestas.',
  ].join('\n');
  bot.reply(message, bairesResponse);
});

/**
 * Channel Debugging
 */
controller.hears('test', ['direct_mention', 'direct_message'], (bot, message) => {
  debug('message', JSON.stringify(message, null, 2));
  bot.reply(message, 'testing');
});

/**
 * Uncaught Messages
 */
controller.hears('.*', ['direct_message', 'direct_mention'], (bot, message) => {
  debug('not caught', JSON.stringify(message, null, 2));
});
