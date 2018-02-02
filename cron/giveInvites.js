const { CronJob } = require('cron')
const script = require('../scripts/give-invites')
const config = require('../lib/config')
const checkConfig = require('../lib/check-config')
checkConfig(config, ['CHANNEL_ANNOUNCEMENT'])

function sendMessageAsAdmin (bot) {
  bot.startConversation({
    channel: config.CHANNEL_ANNOUNCEMENT,
    text: 'give invites'
  }, function (err, convo) {
    if (err) throw err
    convo.ask({
      channel: config.CHANNEL_ANNOUNCEMENT,
      text: 'give-invites done'
    })
  }
  )
}

function giveInvites (bot) {
  // It will run the first day of the month
  // (Seconds, Minutes, Hours, Day of Month, Months, Day of Week)
  new CronJob('* * * 1 * *', async function () {
    await script()
    sendMessageAsAdmin(bot)
  }, null, true, 'America/New_York')
}

module.exports = { giveInvites }
