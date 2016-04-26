'use strict';
let request = require('superagent');
let token =  process.env.SLACK_ADMIN_TOKEN || '';

module.exports = function (bot, message) {
  let email = message.match[1];
  let data = { email, token };

  request
  .post(`https://colombia-dev.slack.com/api/users.admin.invite`)
  .type('form')
  .send(data)
  .end();

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
