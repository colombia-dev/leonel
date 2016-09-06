'use strict';

const Promise = require('bluebird');
const debug = require('debug')('bot:guests');
const logError = require('debug')('bot:error');

function guests(bot, message) {
  debug('begin');
  let user = message.user;
  let getData = Promise.promisify(bot.botkit.storage.users.get);
  let guestsInviteResults = {
    ok: 'Invitado',
    already_invited: 'Ya se invitó',
    already_in_team: 'Ya está registrado',
  };

  return getData(user)
    .then((data) => {
      debug('pana', data);
      debug('panas', data.guests);

      if (data.guests.length === 0) {
        return bot.reply(message, 'Oe, invitá un parcero primero!');
      }

      return bot.reply(message, [
          'Tus parceros:',
          '\n',
          `${data.guests.map((guest) => `${guest.guest}: ${guestsInviteResults[guest.result]}`).join('\n')}`,
        ].join(' '));
    })
    .catch(err => {
      logError('caught', err);
      return bot.reply(message, 'Error - servidor falló');
    });
}

module.exports = guests;
