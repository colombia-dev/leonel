'use strict';

const Botkit = require('botkit');
const invite = require('./lib/invite');
const onboard = require('./lib/onboard');
const storage = require('botkit-storage-mongo')({ mongoUri: process.env.MONGO_URI });
const debug = require('debug')('bot:main');
const config = require('./package.json');

// Expect a SLACK_TOKEN environment variable
let slackToken = process.env.SLACK_TOKEN;
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
    'Yo no soy coqueto... soy un tierno. https://www.youtube.com/watch?v=sFpdl0EiLkA'
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
    `... y me podes estender en ${config.homepage}`,
  ].join('\n');
  bot.reply(message, help);
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

