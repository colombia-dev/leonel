'use strict'

const Promise = require('bluebird')
const request = require('superagent-bluebird-promise')
const moment = require('moment')
const debug = require('debug')('bot:invite')
const logError = require('debug')('bot:error')
const config = require('./config')

const token = config.SLACK_ADMIN_TOKEN
const teamName = config.SLACK_TEAM_NAME
const orgUrl = `https://${teamName}.slack.com/api/users.admin.invite`

function invite (bot, message) {
  debug('begin', message.match[1])
  let guest = message.match[1]
  let host = message.user
  let params = { email: guest, token }
  let getData = Promise.promisify(bot.botkit.storage.users.get)
  let saveData = Promise.promisify(bot.botkit.storage.users.save)
  let userData

  return getData(host)
    .then((data) => {
      userData = data
      return validatePermissions(data)
    })
    .then(() => request.post(orgUrl).type('form').send(params))
    .then(handleResponse)
    .then((invitation) => {
      debug('complete', invitation)

      bot.reply(message, invitation.reply)

      if (!Array.isArray(userData.guests)) {
        userData.guests = []
      }

      userData.guests.push(invitation.log)

      if (invitation.log.result === 'ok') {
        userData.invites--
      }

      return saveData(userData)
    })
    .catch(err => {
      debug('catch')
      let serverError = (err.res && err.res.statusCode !== 200)

      if (serverError) {
        err.message = `El servidor respondió de mala gana con estatus ${err.res.statusCode}`
      }

      if (err.message) {
        logError('caught', err.message)
        return bot.reply(message, err.message)
      }

      logError('caught', err)
      return bot.reply(message, '😱 ¡Tu invitación no funcionó! Reporta el error en https://github.com/colombia-dev/leonel/issues/new')
    })
}

function validatePermissions (data) {
  const {BOT_ENV} = require('process').env
  const stagingBot = (BOT_ENV && BOT_ENV === 'staging')
  const isMaintainer = (data && data.is_maintainer === true)

  if (stagingBot && !isMaintainer) {
    return Promise.reject(new Error('Solo los maintainers pueden enviar invitaciones con @leonel-test'))
  }

  debug('validatePermissions')
  return new Promise((resolve, reject) => {
    if (!data) {
      return reject(new Error('Creo que mi base de datos tiene un error, podés reportar esto en https://github.com/colombia-dev/leonel/issues/new ?'))
    }

    let validAge = moment().subtract(30, 'days')
    let accountAge = moment(data.createdAt)

    if (!accountAge.isSameOrBefore(validAge)) {
      let days = accountAge.diff(validAge, 'days')
      let message = `Debes ser miembro :coldev: por ${days} días más pa poder invitar gente.`
      return reject(new Error(message))
    }

    if (data.invites <= 0) {
      let message = 'Has agotado tus invitaciones mensuales. El 1ro de cada mes repartimos 1 invitación por usuario.'
      return reject(new Error(message))
    }

    resolve()
  })
}

function handleResponse (res) {
  debug('handleResponse', res.body)
  return new Promise((resolve, reject) => {
    let reply = '¡Invitación etsitosa!'
    let guest = res.request._data.email
    let log
    let result = 'ok'

    if (res.body.error) {
      result = res.body.error
      if (res.body.error === 'already_invited') {
        reply = `No podés invitar a ${guest} por que ya lo invitaron.`
      }

      if (res.body.error === 'already_in_team') {
        reply = `No podés invitar a ${guest} por que ya tiene cuenta en este Slack.`
      }
    }

    log = { guest, result }
    resolve({ reply, log })
  })
}

module.exports = invite
