'use strict';

const Promise = require('bluebird');
const debug = require('debug')('bot:guests');
const logError = require('debug')('bot:error');

function guests(bot, message) {
  debug('begin');
  let user = message.user;
  let getData = Promise.promisify(bot.botkit.storage.users.get);

  return getData(user)
    .then((data) => {
      debug('pana', data);
      debug('panas', data.guests);

      if (data.guests.length === 0) {
        return bot.reply(message, 'Oiga, invitá un parcero primero!');
      }

      const activeGuests = data.guests.filter((guest) => guest.result === 'ok');
      if (activeGuests.length === 0) {
        return bot.reply(message, 'No hay parceros activos, invitá uno ome!');
      }

      return bot.reply(message, [
          'Tus parceros:',
          '\n',
          `${activeGuests.map((guest) => guest.guest).join('\n')}`,
        ].join(' '));
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
    });
}

module.exports = guests;
