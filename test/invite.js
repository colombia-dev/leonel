import test from 'ava';
import invite from '../lib/invite';
import _ from 'lodash';
import sinon from 'sinon';
import nock from 'nock';
import querystring from 'querystring';

// setup good invitation test
test.beforeEach(t => {
  let guest = 'buritica@gmail.com';
  let userID = 'userID';

  // configure storage stubs
  let hostData = {
    id: userID,
    guests: ['previous@gmail.com'],
  };

  let storage =  {
    users: {
      get: sinon.stub(),
      save: sinon.stub(),
    },
  };

  storage.users.get.callsArgWith(1, null, hostData);
  storage.users.save.callsArg(1);

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
      user: {
        id: userID,
      },
    },
  };
});

test.cb('it sends new invitation', t => {
  t.plan(2);
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply((uri, body, cb) => {
      let { email, token } = querystring.parse(body);
      t.is(email, t.context.guest, `email is ${email}`);
      t.is(token, process.env.SLACK_ADMIN_TOKEN, `token is ${token}`);
      cb(null, [200, { ok: true }]);
    });

  invite(t.context.bot, t.context.message, t.end);
});

test.cb('it replies to new invitation success', t => {
  let confirmation = 'Invitación esitosa!';
  t.plan(1);
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  invite(t.context.bot, t.context.message, () => {
    let calledWith = t.context.bot.reply.calledWith(
      t.context.message,
      confirmation
    );

    t.true(calledWith, 'bot replied');
    t.end(null);
  });
});

test.cb.only('it logs invitation in hosts storage', t => {
  let { bot, message, guest, email } = t.context;
  let { storage } = bot.botkit;
  t.plan(3);
  nock('https://colombia-dev.slack.com')
    .post('/api/users.admin.invite')
    .reply(200, { ok: true });

  invite(bot, message, function () {
    let getCalledWith = storage.users.get.calledWith(message.user);
    let [previousGuest, newGuest] = storage.users.save.args[0][0].guests;

    t.true(getCalledWith, 'finds host data');
    t.is(newGuest, guest, `logged guest is ${email}`);
    t.is(previousGuest, 'previous@gmail.com', `logged guest is ${previousGuest}`);
    t.end(null);
  });

});

test.todo('it creates storage if it doesn\'t exist yet');

test.todo('it replies with error on failure');

