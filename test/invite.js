import test from 'ava';
import invite from '../lib/invite';
import _ from 'lodash';
import sinon from 'sinon';
import nock from 'nock';
import querystring from 'querystring';

// setup good invitation test
test.beforeEach(t => {
  let guest = 'buritica@gmail.com';
  t.context = {
    guest,
    bot: {},
    message: {
      match: [`invite a ${guest}`, `${guest}`],
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
      t.end(null);
    });

  invite(t.context.bot, t.context.message);
});

test.todo('it replies to new invitation success');

test.todo('it logs invitation in users storage');

test.todo('it creates storage if it doesn\'t exist yet');

test.todo('it replies with error on failure');

