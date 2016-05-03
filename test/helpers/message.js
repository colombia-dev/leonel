'use strict';
let debug = require('debug')('helper:message');

function Message(opts) {
  opts = opts || {};

  debug('init', opts);
  let match = opts.match || '*.';
  let user = opts.user || 'user123';

  return {
    match,
    user,
  };
}

module.exports = Message;
