function coinMiddleware (patterns, message) {
  const re = /(BTC|BCH|ETH|LTC|XRP)/gi
  if (re.test(message.text)) {
    return true
  }
  return false
}

module.exports = coinMiddleware
