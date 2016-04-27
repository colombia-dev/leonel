'use strict';
let request = require('superagent');
let debug = require('debug')('bot:invite');
let token =  process.env.SLACK_ADMIN_TOKEN || '';
let noop = () => {};

module.exports = function (bot, message, cb) {
  let email = message.match[1];
  let data = { email, token };
  let storage = bot.botkit.storage;
  cb = cb || noop;
  debug(`${email}`);

  request
  .post(`https://colombia-dev.slack.com/api/users.admin.invite`)
  .type('form')
  .send(data)
  .end((err, res) => {
    debug('response', res.body);
    if (err) {
      return debug('error: Invalid response ${res.status}');
    }

    storage.users.get(message.user, (err, userData) => {
      debug(`got user data for user:${message.user.id}`, userData);
      userData.guests.push(email);
      storage.users.save(userData, () => {
        bot.reply(message, 'Invitación esitosa!');
        cb(null);
      });
    });

  });

  // console.log('FUMG', bot, message);
  // console.log('FUMG', message);
  // var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
  // var time = new Date();
  // var controller = this;

  // controller.storage.users.get(message.user, function(err, user_data) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   console.log('data', user_data);

  //   if (!user_data) {
  //     controller.storage.users.save({id: message.user, guests:[message.text]});
  //   } else {
  //     user_data.guests.push(message.text);
  //     controller.storage.users.save(user_data, function() {
  //       bot.reply(message, 'saved');
  //     });
  //   }

  // });

  // this.storage.users.save({id: message.user, foo:`bar${time}`}, function(err) {
  //   bot.reply(message, 'saved');
  // });
};
