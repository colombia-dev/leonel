'use strict'

const debug = require('debug')('helper:message')

function Message (opts) {
  opts = opts || {}

  debug('init', opts)

  let match = opts.match || '*.'
  let user = opts.user || 'user123'
  let text = opts.text || ''

  return {
    match,
    user,
    text
  }
}

module.exports = Message
