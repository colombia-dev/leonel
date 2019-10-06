'use strict'

const debug = require('debug')('helper:message')

function Message (opts) {
  opts = opts || {}

  debug('init', opts)

  const match = opts.match || '*.'
  const user = opts.user || 'user123'
  const text = opts.text || ''

  return {
    match,
    user,
    text
  }
}

module.exports = Message
