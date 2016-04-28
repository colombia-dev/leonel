import test from 'ava';
import invite from '../lib/invite';
import _ from 'lodash';
import sinon from 'sinon';
import nock from 'nock';
import querystring from 'querystring';

// setup good invitation test
test.beforeEach(t => {
  let guest = 'buritica@gmail.com';

  // configure storage stubs
  let storage =  {
    users: {
      get: sinon.stub().callsArgWith(1, null, null),
      save: sinon.stub().callsArg(1),
    },
  };

  // export context
  t.context = {
    guest,
    bot: {
      reply: sinon.spy(),
      botkit: {
        storage: storage,
      },
    },
    message: {
      match: [`invite a ${guest}`, `${guest}`],
      user:  'user123',
    },
  };
});

test.cb('it sends new invitation', t => {
  t.plan(2);

  let { bot, guest, message } = t.context;
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply((uri, body, cb) => {
      let { email, token } = querystring.parse(body);

      t.is(email, guest, `email is ${email}`);
      t.is(token, process.env.SLACK_ADMIN_TOKEN, `token is ${token}`);
      cb(null, [200, { ok: true }]);
    });

  // make invitation request
  invite(bot, message, t.end);
});

test.cb('it replies to new invitation success', t => {
  t.plan(1);

  let { bot, guest, message } = t.context;
  let confirmation = 'Invitación esitosa!';
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  // make invitation request
  invite(bot, message, () => {
    let calledWith = bot.reply.calledWith(message, confirmation);
    t.true(calledWith, 'bot replied');
    t.end(null);
  });
});

test.cb('it logs invitation on user on new storage', t => {
  t.plan(2);

  let { bot, message, guest, email } = t.context;
  let { storage } = bot.botkit;
  let confirmation = 'Invitación esitosa!';
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  // make invitation request
  invite(bot, message, function () {
    let saveCalledWith = storage.users.save.calledWith({
      id: 'user123',
      guests: ['buritica@gmail.com'],
    });
    let replyCalledWith = bot.reply.calledWith(message, confirmation);

    t.true(replyCalledWith, 'bot replied');
    t.true(saveCalledWith, `logged guest is ${email} on new storage`);
    t.end(null);
  });
});

test.cb('it adds log to existing hosts storage', t => {
  t.plan(3);

  let { bot, guest, message, email } = t.context;
  let { storage } = bot.botkit;
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  // setup storage
  let hostData = {
    id: 'userID',
    guests: ['previous@gmail.com'],
  };
  storage.users.get.callsArgWith(1, null, hostData);

  // make invitation request
  invite(bot, message, function () {
    let getCalledWith = storage.users.get.calledWith(message.user);
    let [previousGuest, newGuest] = storage.users.save.args[0][0].guests;

    t.true(getCalledWith, 'finds host data');
    t.is(newGuest, guest, `logged guest is ${email}`);
    t.is(previousGuest, 'previous@gmail.com', `logged guest is ${previousGuest}`);
    t.end(null);
  });
});

test.todo('it logs result of invitation');

test.todo('it replies with error on failure');

test.todo('it only allows accounts older than 2 months to send invitations');

