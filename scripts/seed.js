'use strict'

const Promise = require('bluebird')
const Botkit = require('botkit')
const storage = require('botkit-storage-mongo')({ mongoUri: process.env.MONGO_URI })

let updates = []

// Expect a SLACK_TOKEN environment variable
let token = process.env.SLACK_TOKEN
if (!token) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

let controller = Botkit.slackbot({ storage })
let bot = controller.spawn({ token })
let userSave = Promise.promisify(bot.botkit.storage.users.save)
let userGet = Promise.promisify(bot.botkit.storage.users.get)

bot.api.users.list({}, (err, res) => {
  if (err) { throw err }

  res.members.forEach(member => {
    userGet(member.id).then((user) => {
      console.log('%s', member.name)
      let updatedUser = {
        id: member.id,
        name: member.name,
        real_name: member.profile.real_name_normalized,
        email: member.profile.email,
        guests: (user && user.guests) || [],
        invites: 3,
        is_owner: member.is_owner,
        is_admin: member.is_admin,
        is_bot: member.is_bot,
        createdAt: (user && user.createdAt) || Date.now()
      }

      updates.push(userSave(updatedUser))
    })
  })
  setTimeout(() => {
    Promise.all(updates).then(() => {
      console.log('%s users updated', updates.length)
    })
  }, 5000)
})
