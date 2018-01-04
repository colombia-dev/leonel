function coinMiddleware (patterns, message) {
  const re = /(BTC|BCH|ETH|LTC|XRP|ADA|IOT|XEM|XLM|DASH)/gi
  if (re.test(message.text)) {
    return true
  }
  return false
}

module.exports = coinMiddleware
