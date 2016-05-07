'use strict';
let request = require('superagent');
let async = require('async');
let moment = require('moment');
let debug = require('debug')('bot:invite');
let logError = require('debug')('bot:error');
let token =  process.env.SLACK_ADMIN_TOKEN || '';
let _ = require('lodash');
let noop = () => {};

if (!token) {
  console.error('SLACK_ADMIN_TOKEN is required!');
  process.exit(1);
}

// unfortunately the botkit `hears` cb doesn't expect async
// behavior, so testing for it is difficult. to fix this
// we add a third non-standard param as a `callback` so we can
// predict flow and test better, we end it below
function invite(bot, message, callback) {
  debug('begin');
  let email = message.match[1];
  let data = { email, token };
  let storage = bot.botkit.storage;
  callback = callback || noop;

  async.waterfall([
    function validatePermissions(cb) {
      debug('validatePermissions');
      storage.users.get(message.user, (err, data) => {
        if (err) { return cb(err); }

        let validAge = moment().subtract(45, 'days');
        let accountAge = moment(data.createdAt);

        if (!accountAge.isSameOrBefore(validAge)) {
          let error = {
            invalidPermissions: true,
            daysToPermissions: accountAge.diff(validAge, 'days'),
          };
          return cb(error);
        }

        cb(null);

      });
    },

    function inviteToSlack(cb) {
      debug(`inviteToSlack ${email}`);

      request.post(`https://colombia-dev.slack.com/api/users.admin.invite`)
        .type('form')
        .send(data)
        .end(cb);
    },

    function handleResponse(res, cb) {
      debug('handleResponse status:%s', res.status, res.body);
      if (!res.body.ok) {
        return cb(res);
      }

      cb(null, storage, message.user, email, 'ok');
    },

    logInvitation,
  ], function (err) {
    if (err) {return handleError(err, email, bot, message, callback);}

    let replyMessage = [
      '¡Invitación esitosa!',
      'Le cuento que ud es responsable por sus invitados y yo tengo buena memoria :wink:.',
    ].join(' ');

    bot.reply(message, replyMessage, callback);
    debug(`invitation by ${message.user} to ${email} complete`);
  });
}

function logInvitation(storage, host, guest, result, cb) {
  debug(`logInvitation to ${guest} on host:${host}`);
  storage.users.get(host, (err, data) => {
    if (err) { return cb(err); }

    let guestLog = { guest: guest, result: result };

    if (data === null) {
      data = { id: host, guests: [guestLog] };
    } else {
      if (!_.isArray(data.guests)) {
        data.guests = [];
      }

      data.guests.push(guestLog);
    }

    storage.users.save(data, cb);
  });
}

function handleError(err, guest, bot, message, cb) {
  debug('handleError');
  cb = cb || noop;
  logError(err, err);
  let serverError = (err.response && err.response.statusCode !== 200);
  let slackError = (err.body && err.body.ok === false);
  let permissionsError = (err.invalidPermissions);
  let replyMessage = 'Error - esa invitación no funcionó, échele una miradita al log';
  let result;

  if (permissionsError) {
    debug('permissionsError');
    let days = err.daysToPermissions;
    replyMessage = `Error - debes esperar ${days} días para poder invitar a otras personas`;
    return bot.reply(message, replyMessage, cb);
  }

  if (serverError) {
    debug('serverError');
    result = 'server.response ${err.response.statusCode}';
    replyMessage = `El servidor respondió de mala gana con estatus ${err.response.statusCode}`;
  }

  if (slackError) {
    result = err.body.error;
    debug('slackError %s %s', guest, result);
    if (result === 'already_invited') {
      replyMessage = `Error - a ${guest} ya lo invitaron`;
    }

    if (result === 'already_in_team') {
      replyMessage = `Error - ${guest} ya tiene cuenta en este Slack`;
    }
  }

  return logInvitation(bot.botkit.storage, message.user, guest, result, () => {
    bot.reply(message, replyMessage, cb);
  });
}

// expose module
module.exports = invite;
