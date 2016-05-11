'use strict';

let debug = require('debug')('bot:onboard');
let Promise = require('bluebird');

function onboard(bot, message) {
  debug('begin');

  let introChannel = process.env.CHANNEL_INTROS;
  let saveData = Promise.promisify(bot.botkit.storage.users.save);
  let introText = [
    `Ole @${message.user.name}, que bueno tenerte por estas tierras.`,
    'Pa romper el hielo, cuéntanos... ¿Dónde vives y a qué te dedicas?',
  ].join(' ');

  bot.say({ text: introText, channel: introChannel });

  bot.startPrivateConversation({ user: message.user.id }, function (err, convo) {
    convo.say(
      '¡Hola! Ya que acabas de llegar por aquí te cuento unas cositas sobre colombia.dev: \n' +
      '• Somos una comunidad de personas interasadas en programación y diseño ' +
      'nacidas o residentes en :flag-co: \n' +
      '• Hay diferentes canales organizados por tema, únete a los que te interesen. \n' +
      '• #trabajos es el único lugar donde se permiten ofertas o busquedas laborales \n'
    );
    convo.say(
      'Finalmente, al pertenecer a esta comunidad adoptas nuestro código de conducta' +
      'https://github.com/colombia-dev/codigo-de-conducta/blob/master/README.md'
    );
  });

  debug('complete');
  return saveData({
    id: message.user.id,
    createdAt: new Date(),
  });
}

module.exports = onboard;
