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
      reply: sinon.stub().callsArg(2),
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
  let reply = 'Invitación esitosa!';
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  // make invitation request
  invite(bot, message, () => {
    let calledWith = bot.reply.calledWith(message, reply);
    t.true(calledWith, 'bot replied');
    t.end(null);
  });
});

test.cb('it logs invitation on user on new storage', t => {
  t.plan(2);

  let { bot, message, guest, email } = t.context;
  let { storage } = bot.botkit;
  let reply = 'Invitación esitosa!';
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  // make invitation request
  invite(bot, message, function () {
    let saveCalledWith = storage.users.save.calledWith({
      id: 'user123',
      guests: [{ guest: 'buritica@gmail.com', result: 'ok' }],
    });
    let replyCalledWith = bot.reply.calledWith(message, reply);

    t.true(saveCalledWith, `logged guest is ${email} on new storage`);
    t.true(replyCalledWith, 'bot replied');
    t.end(null);
  });
});

test.cb('it adds log to existing hosts storage', t => {
  t.plan(4);

  let { bot, guest, message, email } = t.context;
  let { storage } = bot.botkit;
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  // setup storage
  let hostData = {
    id: 'userID',
    guests: [{ guest: 'previous@gmail.com', result: 'ok' }],
  };
  storage.users.get.callsArgWith(1, null, hostData);

  // make invitation request
  invite(bot, message, function () {
    let getCalledWith = storage.users.get.calledWith(message.user);
    let [previousGuest, newGuest] = storage.users.save.args[0][0].guests;

    t.true(getCalledWith, 'finds host data');
    t.is(newGuest.guest, 'buritica@gmail.com', `logged guest is ${newGuest}`);
    t.is(newGuest.result, 'ok', `logged result is ok`);
    t.is(previousGuest, hostData.guests[0], `logged guest is ${previousGuest}`);
    t.end(null);
  });
});

test.cb('it replies with error if response.status is not 200', t => {
  t.plan(1);

  let { bot, guest, message } = t.context;
  let reply = 'El servidor respondió de mala gana con estatus 500';
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(500, { ok: false });

  // make invitation request
  invite(bot, message, () => {
    t.true(bot.reply.calledWith(message, reply), 'bot replied');
    t.end(null);
  });
});

test.cb('it replies with error message if something along flow errors', t => {
  t.plan(1);

  let { bot, guest, message } = t.context;
  let { storage } = bot.botkit;
  let reply = 'Error - esa invitación no funcionó, échele una miradita al log';
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  // force database failure
  storage.users.get.callsArgWith(1, new Error('fake db failure'), {});

  // make invitation request
  invite(bot, message, () => {
    t.true(bot.reply.calledWith(message, reply), 'bot replied');
    t.end(null);
  });
});

test.todo('it only allows accounts older than 2 months to send invitations');

