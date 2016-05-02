'use strict';
import test from 'ava';
// import onboard from '../lib/onboard';
// import sinon from 'sinon';
// import nock from 'nock';
// import querystring from 'querystring';

// test.cb('it sends new invitation', t => {
//   t.plan(2);

//   let { bot, guest, message } = t.context;
//   nock('https://colombia-dev.slack.com')
//     .post('/api/users.admin.invite')
//     .reply((uri, body, cb) => {
//       let { email, token } = querystring.parse(body);

//       t.is(email, guest, `email is ${email}`);
//       t.is(token, process.env.SLACK_ADMIN_TOKEN, `token is ${token}`);
//       cb(null, [200, { ok: true }]);
//     });

//   // make invitation request
//   invite(bot, message, t.end);
// });

test.todo('welcomes new user');
test.todo('creates new user storage');
test.todo('records date user joined');

