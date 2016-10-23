'use strict'

const config = {
  SLACK_TOKEN: process.env.SLACK_TOKEN,
  SLACK_ADMIN_TOKEN: process.env.SLACK_ADMIN_TOKEN,
  SLACK_TEAM_NAME: process.env.SLACK_TEAM_NAME || 'colombia-dev',
  DEBUG: process.env.DEBUG || 'bot:*,helper:*',
  MONGO_URI: process.env.MONGO_URI,
  CHANNEL_INTROS: process.env.CHANNEL_INTROS,
  CHANNEL_JOBS: process.env.CHANNEL_JOBS
}

module.exports = config
