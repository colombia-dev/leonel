'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const Botkit = require('botkit');
const storage = require('botkit-storage-mongo')({ mongoUri: process.env.MONGO_URI });

let updates = [];

// Expect a SLACK_TOKEN environment variable
let token = process.env.SLACK_TOKEN;
if (!token) {
  console.error('SLACK_TOKEN is required!');
  process.exit(1);
}

let controller = Botkit.slackbot({ storage });
let bot = controller.spawn({ token });
let userSave = Promise.promisify(bot.botkit.storage.users.save);

bot.api.users.list({}, (err, res) => {
  res.members.forEach(member => {
    console.log('%s', member.name);
    let user = {
      id: member.id,
      name: member.name,
      guests: [],
      createdAt: moment().subtract(46, 'days').toDate(),
    };

    updates.push(userSave(user));
  });

  Promise.all(updates).then(() => {
    console.log('%s users updated', updates.length);
    process.exit(0);
  });
});
