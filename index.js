'use strict';
let Botkit = require('botkit');
let invite = require('./lib/invite');
let storage = require('botkit-storage-mongo')({ mongoUri: process.env.MONGO_URI });

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

bot.startRTM(function (err, bot, payload) {
  if (err) { throw new Error('Could not connect to Slack'); }
});

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, '¡Listo papito, si es ya, es ya!');
});

controller.hears(['coqueto'], ['direct_mention', 'direct_message'], function (bot, message) {
  bot.reply(
    message,
    'Yo no soy coqueto... soy un tierno. https://www.youtube.com/watch?v=sFpdl0EiLkA'
  );
});

controller.hears('invite a <mailto:(.*)\\|.*>', ['direct_message'], invite);

controller.hears(['help', 'ayuda'], ['direct_message', 'direct_mention'], function (bot, message) {
  let help = [
    'Yo respondo a:',
    '- `@leonel invite a me@example.com` para enviar una invitación a este Slack.',
    '- `@leonel ayuda/help` para ver este mensaje.',
  ].join('\n');
  bot.reply(message, help);
});

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Paila <@' + message.user + '>, no entiendo que me pidió\n');
});

