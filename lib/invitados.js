'use strict';

const Promise = require('bluebird');
const request = require('superagent-bluebird-promise');
const debug = require('debug')('bot:invitados');
const logError = require('debug')('bot:error');
const config = require('./config');

function invitados(bot, message) {
  debug('begin');
  let user = message.user;
  let getData = Promise.promisify(bot.botkit.storage.users.get);

  return getData(user)
    .then((data) => {
      debug('pana', data);
      debug('panas', data.guests);

      if(data.guests.length === 0) {
        return bot.reply(message, 'Oiga, invitá un pana primero!');
      }

      const activeGuests = data.guests.filter((guest) => guest.result === 'ok');
      debug({ activeGuests });
      if(activeGuests.length > 0) {
        return bot.reply(message, [
          'Tus panas:',
          '\n',
          `${activeGuests.map((guest) => guest.guest).join('\n')}`
        ].join(' '));
      }
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
      return bot.reply(message, 'Error - servidor falló');
    })
}

module.exports = invitados;