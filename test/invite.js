'use strict'

// = require modules
const test = require('ava')
const _ = require('lodash')
const proxyquire = require('proxyquire')
const invite = require('../lib/invite')
const nock = require('nock')
const querystring = require('querystring')
const moment = require('moment')
const sinon = require('sinon')

// = require test helpers
const BotHelper = require('./helpers/bot')
const StorageHelper = require('./helpers/storage')
const MessageHelper = require('./helpers/message')

test.beforeEach(t => {
  let guest = 'buritica@gmail.com'

  // initialize helpers
  let storage = new StorageHelper()
  let bot = new BotHelper({ storage })
  let message = new MessageHelper({
    user: 'userID',
    match: [`invite a ${guest}`, `${guest}`]
  })
  let teamName = process.env.SLACK_TEAM_NAME || 'colombia-dev'
  let slack = nock(`https://${teamName}.slack.com`)
    .post('/api/users.admin.invite')

  // setup user stubbed data
  let createdAt = moment().subtract(100, 'days')
  let hostData = {
    id: message.user,
    invites: 3,
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // export context
  t.context = {
    slack,
    guest,
    bot,
    message,
    createdAt,
    hostData
  }
})

test.afterEach(nock.cleanAll)

test('it sends new invitation', t => {
  t.plan(2)

  let { slack, bot, guest, message } = t.context
  slack.reply((uri, body, cb) => {
    let { email, token } = querystring.parse(body)

    t.is(email, guest, `email is ${email}`)
    t.is(token, process.env.SLACK_ADMIN_TOKEN, `token is ${token}`)
    cb(null, [200, { ok: true }])
  })

  // make invitation request
  return invite(bot, message)
})

test('it replies to new invitation success', t => {
  t.plan(1)

  let { slack, bot, message } = t.context
  let replyMessage = '¡Invitación etsitosa!'
  slack.reply(200, { ok: true })

  // make invitation request
  return invite(bot, message).then(() => {
    let calledWith = bot.reply.calledWith(message, replyMessage)
    t.true(calledWith, 'bot replied')
  })
})

test('it restricts accounts older than 45 days from sending invitations', (t) => {
  t.plan(1)

  let { bot, message } = t.context
  let { storage } = bot.botkit
  let clock = sinon.useFakeTimers(moment.now())
  let reply = 'Debes ser miembro :coldev: por 45 días más pa poder invitar gente.'

  let hostData = {
    id: message.user,
    createdAt: new Date()
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
    clock.restore()
  })
})

test('it allows accounts older than 45 days to send invitations', (t) => {
  t.plan(1)

  let { slack, bot, message, createdAt } = t.context
  let { storage } = bot.botkit
  let reply = '¡Invitación etsitosa!'

  slack.reply(200, { ok: true })

  let hostData = {
    id: message.user,
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})

test('it adds log to hosts storage with guests', t => {
  t.plan(4)

  let { slack, bot, guest, message, createdAt } = t.context
  let { storage } = bot.botkit
  slack.reply(200, { ok: true })

  // setup storage
  let hostData = {
    id: message.user,
    guests: [{ guest: 'previous@gmail.com', result: 'ok' }],
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    let getCalledWith = storage.users.get.calledWith(message.user)
    let [previousGuest, newGuest] = storage.users.save.args[0][0].guests

    t.true(getCalledWith, 'finds host data')
    t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
    t.is(newGuest.result, 'ok', `logged result is ok`)
    t.is(previousGuest, hostData.guests[0], `logged guest is ${previousGuest}`)
  })
})

test('it adds log to existing hosts storage with no guests', t => {
  t.plan(3)

  let { slack, bot, guest, message, createdAt } = t.context
  let { storage } = bot.botkit
  slack.reply(200, { ok: true })

  // setup storage
  let hostData = {
    id: message.user,
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    let getCalledWith = storage.users.get.calledWith(message.user)
    let [newGuest] = storage.users.save.args[0][0].guests

    t.true(getCalledWith, 'finds host data')
    t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
    t.is(newGuest.result, 'ok', `logged result is ok`)
  })
})

test('it replies with error if response.status is not 200', t => {
  t.plan(1)

  let { slack, bot, message } = t.context
  let reply = 'El servidor respondió de mala gana con estatus 500'
  slack.reply(500, { ok: false })

  // make invitation request
  return invite(bot, message).then(() => {
    t.true(bot.reply.calledWith(message, reply), 'bot replied')
  })
})

test('it replies with error message if user has no data', t => {
  t.plan(2)

  let { bot, message } = t.context
  let { storage } = bot.botkit
  let reply = 'Creo que mi base de datos tiene un error, podés reportar esto en https://github.com/colombia-dev/leonel/issues/new ?'

  // force database failure
  storage.users.get.callsArgWith(1, null, null)

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][0], message, 'called with message')
    t.is(bot.reply.args[0][1], reply, 'called with text')
  })
})

test('it replies and logs error message if user has already been invited', t => {
  t.plan(4)

  let { slack, bot, message, guest, createdAt } = t.context
  let { storage } = bot.botkit
  let reply = `No podés invitar a ${guest} por que ya lo invitaron.`

  // slack reponds with 200 and `ok:false` when things dont work ¯\_(ツ)_/¯
  slack.reply(200, { ok: false, error: 'already_invited' })

  let hostData = {
    id: message.user,
    guests: [{ guest: 'previous@gmail.com', result: 'ok' }],
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    let newGuest = storage.users.save.args[0][0].guests[1]

    t.is(bot.reply.args[0][0], message, 'called with message')
    t.is(bot.reply.args[0][1], reply, 'called with text')
    t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
    t.is(newGuest.result, 'already_invited', `logged result is already_invited`)
  })
})

test('it replies and logs error message if user has already joined team', t => {
  t.plan(3)

  let { slack, bot, message, guest, createdAt } = t.context
  let { storage } = bot.botkit
  let reply = `No podés invitar a ${guest} por que ya tiene cuenta en este Slack.`

  // slack reponds with 200 and `ok:false` when things dont work ¯\_(ツ)_/¯
  slack.reply(200, { ok: false, error: 'already_in_team' })

  let hostData = {
    id: message.user,
    guests: [{ guest: 'previous@gmail.com', result: 'ok' }],
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    let newGuest = storage.users.save.args[0][0].guests[1]

    t.true(bot.reply.calledWith(message, reply), 'bot replied')
    t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
    t.is(newGuest.result, 'already_in_team', `logged result is already_in_team`)
  })
})

test('it replies with default error message if something along flow errors with no message', t => {
  t.plan(2)

  let { bot, message } = t.context
  let { storage } = bot.botkit
  let reply = '😱 ¡Tu invitación no funcionó! Reporta el error en https://github.com/colombia-dev/leonel/issues/new'

  // force database failure
  storage.users.get.callsArgWith(1, new Error(), {})

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][0], message, 'called with message')
    t.is(bot.reply.args[0][1], reply, 'called with text')
  })
})

test('it restricts accounts with 0 invites left from sending invitations', (t) => {
  t.plan(1)

  let { bot, message, hostData } = t.context
  let { storage } = bot.botkit
  let reply = 'Has agotado tus invitaciones mensuales. El 1ro de cada mes repartimos 1 invitación por usuario.'

  hostData.invites = 0
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})

test('it allows accounts with invites to send invitations', t => {
  t.plan(1)

  let { slack, bot, message } = t.context
  let replyMessage = '¡Invitación etsitosa!'
  slack.reply(200, { ok: true })

  // make invitation request
  return invite(bot, message).then(() => {
    let calledWith = bot.reply.calledWith(message, replyMessage)
    t.true(calledWith, 'bot replied')
  })
})

test('it updates the amount of invitations left after one is used', t => {
  t.plan(1)

  let { slack, bot, message } = t.context
  let { storage } = bot.botkit
  slack.reply(200, { ok: true })

  // make invitation request
  return invite(bot, message).then(() => {
    let invites = storage.users.save.args[0][0].invites
    t.is(invites, 2, 'invites are subtracted')
  })
})

test('it doesn\'t update the amount of invitations left if there was an error', t => {
  t.plan(1)

  let { slack, bot, message } = t.context
  let { storage } = bot.botkit
  slack.reply(200, { ok: false, error: 'already_invited' })

  // make invitation request
  return invite(bot, message).then(() => {
    let invites = storage.users.save.args[0][0].invites
    t.is(invites, 3, 'invites are subtracted')
  })
})

test('it prevents non-maintainers from sending invites on staging environment', (t) => {
  t.plan(1)
  let { bot, message, hostData } = t.context
  let { storage } = bot.botkit
  let reply = 'Solo los maintainers pueden enviar invitaciones con @leonel-test'

  // create local staging environment
  const env = _.defaults({BOT_ENV: 'staging'}, process.env)
  const localInvite = proxyquire('../lib/invite', {
    'process': {env}
  })

  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return localInvite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})

test('it allows maintainers to send invites on staging environment', (t) => {
  t.plan(1)
  let { bot, message, hostData, slack } = t.context
  let { storage } = bot.botkit
  let reply = '¡Invitación etsitosa!'

  // create local staging environment
  const env = _.defaults({BOT_ENV: 'staging'}, process.env)
  const localInvite = proxyquire('../lib/invite', {
    'process': {env}
  })

  slack.reply(200, { ok: true })

  hostData.is_maintainer = true
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return localInvite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})
