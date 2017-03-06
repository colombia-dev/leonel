'use strict'

/**
 * Require Modules
 */
const Promise = require('bluebird')
const Botkit = require('botkit')
const monk = require('monk')
const debug = require('debug')('bot:script:seed')

/**
 * Local Variables
 */
const {MONGO_URI, SLACK_TOKEN: token} = require('process').env
if (!MONGO_URI) throw new Error('MONGO_URI is not set')
if (!token) throw new Error('SLACK_TOKEN is required!')

const db = monk(MONGO_URI)
const users = db.get('users')
const updates = []

const controller = Botkit.slackbot()
const bot = controller.spawn({ token })

/**
 * Updates
 * @param  {[type]} member [description]
 * @return {[type]}        [description]
 */
function updateMember (member) {
  const invites = 1
  const {id, name, is_owner, is_admin, is_bot} = member
  const {real_name_normalized: real_name, email} = member.profile
  const $set = {
    id,
    name,
    real_name,
    email,
    invites,
    is_owner,
    is_admin,
    is_bot
  }
  const $setOnInsert = {guests: [], createdAt: new Date()}

  updates.push(
    users.update({id}, {$set, $setOnInsert}, {upsert: true})
    .then(() => debug(`updated ${member.name}`))
  )
}

/**
 * Make request to Slack API so we can get all users and then update them
 */
bot.api.users.list({}, (err, res) => {
  if (err) { throw err }
  debug(`found ${res.members.length} members`)

  res.members.forEach(updateMember)

  Promise.all(updates).then(() => {
    debug('seed complete')
    process.exit()
  })
})
