var Slack = require('slack-client')

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

// Create a new Slack client with our token
var slack = new Slack(slackToken, true, true)

// bot will be initialized when logged in
var bot

// handle loggedIn event
slack.on('loggedIn', function (user, team) {
  bot = user
  console.log('I am ' + user.name + ' of team ' + team.name)
})

// show status when we conntect
slack.on('open', function () {
  console.log('Connected')
})

// register a handler for messages
slack.on('message', function (message) {
  if (isMe(message, bot.id)) return
  if (!isMentioned(message, bot.id) && !isDM(message, bot.id)) return

  console.log('Received message ' + message)

  // We recieved a message that wasn't from us and either mentioned us or was a DM to us
  // Let's ust say hi
  var channel = slack.getChannelGroupOrDMByID(message.channel)
  channel.send('Good day to you from https://beepboophq.com!')
})

// initiate login
slack.login()

// ----------------------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------------------

function isMentioned (message, userId) {
  return message.text.indexOf('<@' + userId) >= 0
}

function isMe (message, userId) {
  return message.user === userId
}

function isDM (message, userId) {
  return message.channel[0] === 'D'
}
