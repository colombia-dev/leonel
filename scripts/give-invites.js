'use strict'

/**
 * Require Modules
 */
const debug = require('debug')('bot:script:give-invites')
const monk = require('monk')

/**
 * Local Variables
 */
const {MONGO_URI} = require('process').env

if (!MONGO_URI) throw new Error('MONGO_URI is not set')

const db = monk(MONGO_URI)
const users = db.get('users')

/**
 * Module Body
 */
function script () {
  debug('giving invites')
  return users.update({}, {$set: {invites: 1}}, {multi: true})
    .then(() => debug('done'))
}

/**
 * Export module or execute
 */
module.exports = script
if (!module.parent) {
  script().then(() => process.exit())
}
