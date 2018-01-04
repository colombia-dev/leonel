'use strict'

const rp = require('request-promise')
const logError = require('debug')('bot:error')

function coinPrice (bot, message) {
  const re = /(BTC|BCH|ETH|LTC|XRP|ADA|IOT|XEM|XLM|DASH)/gi
  const coin = message.text.match(re) ? message.text.match(re)[0].toUpperCase() : null

  if (coin) {
    return rp(`http://www.coincap.io/page/${coin}`)
      .then((coin) => {
        const coinInfo = JSON.parse(coin)
        return bot.reply(message, `*${coinInfo.id} = ${coinInfo.price}* _Price from coincap.io API_`)
      })
      .catch(err => {
        logError('caught', err)
        return bot.reply(message, 'Error - servidor falló')
      })
  }
}

module.exports = coinPrice
