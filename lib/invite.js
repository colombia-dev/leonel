'use strict';
let request = require('superagent');
let async = require('async');
let debug = require('debug')('bot:invite');
let logError = require('debug')('bot:error');
let token =  process.env.SLACK_ADMIN_TOKEN || '';
let noop = () => {};

// unfortunately the botkit `hears` cb doesn't expect async
// behavior, so testing for it is difficult. to fix this
// we add a third non-standard param as a `callback` so we can
// predict flow and test better, we end it below
function invite(bot, message, callback) {
  let email = message.match[1];
  let data = { email, token };
  let storage = bot.botkit.storage;
  let response;
  callback = callback || noop;

  async.waterfall([
    function inviteToSlack(cb) {
      debug(`inviteToSlack ${email}`);

      request.post(`https://colombia-dev.slack.com/api/users.admin.invite`)
        .type('form')
        .send(data)
        .end(cb);
    },

    function handleResponse(res, cb) {
      debug('handleResponse status:%s', res.status, res.body);
      response = res;
      cb(null);
    },

    function getUserData(cb) {
      debug(`getUserData ${message.user}`);
      storage.users.get(message.user, cb);
    },

    function logInvitation(data, cb) {
      debug(`logInvitation to ${email} on user:${message.user}`, data);
      let guestLog = { guest: email, result: undefined };
      let body = response.body;

      if (body.ok) {
        guestLog.result = 'ok';
      }

      if (data === null) {
        data = { id: message.user, guests: [guestLog] };
      } else {
        data.guests.push(guestLog);
      }

      storage.users.save(data, cb);
    },
  ], function (err) {
    if (err) {return handleError(err, bot, message, callback);}

    let replyMessage = 'Invitación esitosa!';
    bot.reply(message, replyMessage, callback);
    debug(`invitation by ${message.user} to ${email} complete`);
  });
}

function handleError(err, bot, message, cb) {
  cb = cb || noop;
  logError(err, err);

  let replyMessage = 'Error - esa invitación no funcionó, échele una miradita al log';
  if (err.response && err.response.statusCode) {
    replyMessage = `El servidor respondió de mala gana con estatus ${err.response.statusCode}`;
  }

  bot.reply(message, replyMessage, cb);
}

// expose module
module.exports = invite;
