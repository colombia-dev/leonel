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
  const guest = 'buritica@gmail.com'

  // initialize helpers
  const storage = new StorageHelper()
  const bot = new BotHelper({ storage })
  const message = new MessageHelper({
    user: 'userID',
    match: [`invite a ${guest}`, `${guest}`]
  })
  const teamName = process.env.SLACK_TEAM_NAME || 'colombia-dev'
  const slack = nock(`https://${teamName}.slack.com`).post(
    '/api/users.admin.invite'
  )

  // setup user stubbed data
  const createdAt = moment().subtract(100, 'days')
  const hostData = {
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

test.serial('it sends new invitation', t => {
  t.plan(2)

  const { slack, bot, guest, message } = t.context
  slack.reply((uri, body, cb) => {
    const { email, token } = querystring.parse(body)

    t.is(email, guest, `email is ${email}`)
    t.is(token, process.env.SLACK_ADMIN_TOKEN, `token is ${token}`)
    cb(null, [200, { ok: true }])
  })

  // make invitation request
  return invite(bot, message)
})

test.serial('it replies to new invitation success', t => {
  t.plan(1)

  const { slack, bot, message } = t.context
  const replyMessage = '¡Invitación etsitosa!'
  slack.reply(200, { ok: true })

  // make invitation request
  return invite(bot, message).then(() => {
    const calledWith = bot.reply.calledWith(message, replyMessage)
    t.true(calledWith, 'bot replied')
  })
})

test('it restricts accounts older than 30 days from sending invitations', t => {
  t.plan(1)

  const { bot, message } = t.context
  const { storage } = bot.botkit
  const clock = sinon.useFakeTimers(moment.now())
  const reply =
    'Debes ser miembro :coldev: por 30 días más pa poder invitar gente.'

  const hostData = {
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

test.serial('it allows accounts older than 30 days to send invitations', t => {
  t.plan(1)

  const { slack, bot, message, createdAt } = t.context
  const { storage } = bot.botkit
  const reply = '¡Invitación etsitosa!'

  slack.reply(200, { ok: true })

  const hostData = {
    id: message.user,
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})

test.serial('it adds log to hosts storage with guests', t => {
  t.plan(4)

  const { slack, bot, guest, message, createdAt } = t.context
  const { storage } = bot.botkit
  slack.reply(200, { ok: true })

  // setup storage
  const hostData = {
    id: message.user,
    guests: [{ guest: 'previous@gmail.com', result: 'ok' }],
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    const getCalledWith = storage.users.get.calledWith(message.user)
    const [previousGuest, newGuest] = storage.users.save.args[0][0].guests

    t.true(getCalledWith, 'finds host data')
    t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
    t.is(newGuest.result, 'ok', 'logged result is ok')
    t.is(previousGuest, hostData.guests[0], `logged guest is ${previousGuest}`)
  })
})

test.serial('it adds log to existing hosts storage with no guests', t => {
  t.plan(3)

  const { slack, bot, guest, message, createdAt } = t.context
  const { storage } = bot.botkit
  slack.reply(200, { ok: true })

  // setup storage
  const hostData = {
    id: message.user,
    createdAt
  }
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    const getCalledWith = storage.users.get.calledWith(message.user)
    const [newGuest] = storage.users.save.args[0][0].guests

    t.true(getCalledWith, 'finds host data')
    t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
    t.is(newGuest.result, 'ok', 'logged result is ok')
  })
})

test.serial('it replies with error if response.status is not 200', t => {
  t.plan(1)

  const { slack, bot, message } = t.context
  const reply = 'El servidor respondió de mala gana con estatus 500'
  slack.reply(500, { ok: false })

  // make invitation request
  return invite(bot, message).then(() => {
    t.true(bot.reply.calledWith(message, reply), 'bot replied')
  })
})

test('it replies with error message if user has no data', t => {
  t.plan(2)

  const { bot, message } = t.context
  const { storage } = bot.botkit
  const reply =
    'Creo que mi base de datos tiene un error, podés reportar esto en https://github.com/colombia-dev/leonel/issues/new ?'

  // force database failure
  storage.users.get.callsArgWith(1, null, null)

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][0], message, 'called with message')
    t.is(bot.reply.args[0][1], reply, 'called with text')
  })
})

test.serial(
  'it replies and logs error message if user has already been invited',
  t => {
    t.plan(4)

    const { slack, bot, message, guest, createdAt } = t.context
    const { storage } = bot.botkit
    const reply = `No podés invitar a ${guest} por que ya lo invitaron.`

    // slack reponds with 200 and `ok:false` when things dont work ¯\_(ツ)_/¯
    slack.reply(200, { ok: false, error: 'already_invited' })

    const hostData = {
      id: message.user,
      guests: [{ guest: 'previous@gmail.com', result: 'ok' }],
      createdAt
    }
    storage.users.get.callsArgWith(1, null, hostData)

    // make invitation request
    return invite(bot, message).then(() => {
      const newGuest = storage.users.save.args[0][0].guests[1]

      t.is(bot.reply.args[0][0], message, 'called with message')
      t.is(bot.reply.args[0][1], reply, 'called with text')
      t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
      t.is(
        newGuest.result,
        'already_invited',
        'logged result is already_invited'
      )
    })
  }
)

test.serial(
  'it replies and logs error message if user has already joined team',
  t => {
    t.plan(3)

    const { slack, bot, message, guest, createdAt } = t.context
    const { storage } = bot.botkit
    const reply = `No podés invitar a ${guest} por que ya tiene cuenta en este Slack.`

    // slack reponds with 200 and `ok:false` when things dont work ¯\_(ツ)_/¯
    slack.reply(200, { ok: false, error: 'already_in_team' })

    const hostData = {
      id: message.user,
      guests: [{ guest: 'previous@gmail.com', result: 'ok' }],
      createdAt
    }
    storage.users.get.callsArgWith(1, null, hostData)

    // make invitation request
    return invite(bot, message).then(() => {
      const newGuest = storage.users.save.args[0][0].guests[1]

      t.true(bot.reply.calledWith(message, reply), 'bot replied')
      t.is(newGuest.guest, guest, `logged guest is ${newGuest}`)
      t.is(
        newGuest.result,
        'already_in_team',
        'logged result is already_in_team'
      )
    })
  }
)

test('it replies with default error message if something along flow errors with no message', t => {
  t.plan(2)

  const { bot, message } = t.context
  const { storage } = bot.botkit
  const reply =
    '😱 ¡Tu invitación no funcionó! Reporta el error en https://github.com/colombia-dev/leonel/issues/new'

  // force database failure
  storage.users.get.callsArgWith(1, new Error(), {})

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][0], message, 'called with message')
    t.is(bot.reply.args[0][1], reply, 'called with text')
  })
})

test('it restricts accounts with 0 invites left from sending invitations', t => {
  t.plan(1)

  const { bot, message, hostData } = t.context
  const { storage } = bot.botkit
  const reply =
    'Has agotado tus invitaciones mensuales. El 1ro de cada mes repartimos 1 invitación por usuario.'

  hostData.invites = 0
  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return invite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})

test.serial('it allows accounts with invites to send invitations', t => {
  t.plan(1)

  const { slack, bot, message } = t.context
  const replyMessage = '¡Invitación etsitosa!'
  slack.reply(200, { ok: true })

  // make invitation request
  return invite(bot, message).then(() => {
    const calledWith = bot.reply.calledWith(message, replyMessage)
    t.true(calledWith, 'bot replied')
  })
})

test.serial(
  'it updates the amount of invitations left after one is used',
  t => {
    t.plan(1)

    const { slack, bot, message } = t.context
    const { storage } = bot.botkit
    slack.reply(200, { ok: true })

    // make invitation request
    return invite(bot, message).then(() => {
      const invites = storage.users.save.args[0][0].invites
      t.is(invites, 2, 'invites are subtracted')
    })
  }
)

test.serial(
  "it doesn't update the amount of invitations left if there was an error",
  t => {
    t.plan(1)

    const { slack, bot, message } = t.context
    const { storage } = bot.botkit
    slack.reply(200, { ok: false, error: 'already_invited' })

    // make invitation request
    return invite(bot, message).then(() => {
      const invites = storage.users.save.args[0][0].invites
      t.is(invites, 3, 'invites are subtracted')
    })
  }
)

test('it prevents non-maintainers from sending invites on staging environment', t => {
  t.plan(1)
  const { bot, message, hostData } = t.context
  const { storage } = bot.botkit
  const reply =
    'Solo los maintainers pueden enviar invitaciones con @leonel-test'

  // create local staging environment
  const env = _.defaults({ BOT_ENV: 'staging' }, process.env)
  const localInvite = proxyquire('../lib/invite', {
    process: { env }
  })

  storage.users.get.callsArgWith(1, null, hostData)

  // make invitation request
  return localInvite(bot, message).then(() => {
    t.is(bot.reply.args[0][1], reply, 'bot replied')
  })
})

test.serial(
  'it allows maintainers to send invites on staging environment',
  t => {
    t.plan(1)
    const { bot, message, hostData, slack } = t.context
    const { storage } = bot.botkit
    const reply = '¡Invitación etsitosa!'

    // create local staging environment
    const env = _.defaults({ BOT_ENV: 'staging' }, process.env)
    const localInvite = proxyquire('../lib/invite', {
      process: { env }
    })

    slack.reply(200, { ok: true })

    hostData.is_maintainer = true
    storage.users.get.callsArgWith(1, null, hostData)

    // make invitation request
    return localInvite(bot, message).then(() => {
      t.is(bot.reply.args[0][1], reply, 'bot replied')
    })
  }
)
