'use strict'

/**
 * Require Modules
 */
const test = require('ava')
const script = require('../../scripts/give-invites')
const db = require('monk')(process.env.MONGO_URI)

/**
 * Local Variables
 */

/**
 * Test Hooks
 */

test.beforeEach(t => {
  t.context.users = db.get('users')
  const user = {
    name: 'burititest',
    real_name: 'Juan Tester Buritica',
    email: 'burititester@gmail.com',
    guests: [],
    invites: 0,
    is_owner: false,
    is_admin: false,
    is_bot: false,
    createdAt: Date.now()
  }
  return t.context.users.insert(user)
    .then(user => { t.context.user = user })
})

test.afterEach(t => {
  const {users, user} = t.context
  return users.remove({_id: user._id})
})

/**
 * Module Tests
 */

test('it exists', t => {
  t.is(typeof script, 'function')
})

test('it gives all users one invite', t => {
  const {users, user} = t.context
  return script()
    .then(() => users.findOne({_id: user._id}))
    .then(user => t.is(user.invites, 1, 'user has one invite'))
})
