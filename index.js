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
  bot.reply(message, 'I\'m here!');
});

controller.hears('invite a <mailto:(.*)\\|.*>', ['direct_message'], invite);

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  let help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.';
  bot.reply(message, help);
});

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n');
});

