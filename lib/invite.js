'use strict';

let Promise = require('bluebird');
let request = require('superagent-bluebird-promise');
let moment = require('moment');
let debug = require('debug')('bot:invite');
let logError = require('debug')('bot:error');
let _ = require('lodash');

let token =  process.env.SLACK_ADMIN_TOKEN || '';
let orgUrl = 'https://colombia-dev.slack.com/api/users.admin.invite';

function invite(bot, message) {
  debug('begin', message.match[1]);
  let guest = message.match[1];
  let host = message.user;
  let params = { email: guest, token };
  let getData = Promise.promisify(bot.botkit.storage.users.get);
  let saveData = Promise.promisify(bot.botkit.storage.users.save);
  let userData;

  return getData(host)
    .then((data) => {
      userData = data;
      return validatePermissions(data);
    })
    .then(() => request.post(orgUrl).type('form').send(params))
    .then(handleResponse)
    .then((invitation) => {
      debug('complete', invitation);

      bot.reply(message, invitation.reply);

      if (!_.isArray(userData.guests)) {
        userData.guests = [];
      }

      userData.guests.push(invitation.log);
      return saveData(userData);
    })
    .catch(err => {
      debug('catch');
      let serverError = (err.res && err.res.statusCode !== 200);

      if (serverError) {
        err.reply = `El servidor respondió de mala gana con estatus ${err.res.statusCode}`;
      }

      if (err.reply) {
        logError('caught', err.reply);
        return bot.reply(message, err.reply);
      }

      logError('caught', err);
      return bot.reply(message, 'Error - esa invitación no funcionó, échele una miradita al log');
    });
}

function validatePermissions(data) {
  debug('validatePermissions');
  return new Promise((resolve, reject) => {
    if (!data) {
      return reject({ reply: 'Error - hubo un problema encontrando su cuenta' });
    }

    let validAge = moment().subtract(45, 'days');
    let accountAge = moment(data.createdAt);

    if (!accountAge.isSameOrBefore(validAge)) {
      let days = accountAge.diff(validAge, 'days');
      let reply = `Error - debes esperar ${days} días para poder invitar a otras personas`;
      return reject({ reply });
    }

    resolve();
  });
}

function handleResponse(res) {
  debug('handleResponse', res.body);
  return new Promise((resolve, reject) => {
    let reply = [
      '¡Invitación esitosa!',
      'Le cuento que ud es responsable por sus invitados y yo tengo buena memoria :wink:.',
    ].join(' ');
    let guest = res.request._data.email;
    let log;
    let result = 'ok';

    if (res.body.error) {
      result = res.body.error;
      if (res.body.error === 'already_invited') {
        reply = `Error - a ${guest} ya lo invitaron`;
      }

      if (res.body.error === 'already_in_team') {
        reply = `Error - ${guest} ya tiene cuenta en este Slack`;
      }
    }

    log = { guest, result };
    resolve({ reply, log });
  });
}

module.exports = invite;
