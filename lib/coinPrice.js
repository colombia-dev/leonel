'use strict'

const rp = require('request-promise')
const logError = require('debug')('bot:error')

const coinsSymbols = require('./../constants/coinsSymbols')

function coinPrice (bot, message) {
  const re = /(BTC|BCH|ETH|LTC|XRP|ADA|IOT|XEM|XLM|DASH)/gi
  const coinSymbol = message.text.match(re) ? message.text.match(re)[0].toUpperCase() : null

  if (coinSymbol) {
    return rp(`https://api.coincap.io/v2/rates/${coinsSymbols[coinSymbol]}`)
      .then((coin) => {
        const { data: coinInfo } = JSON.parse(coin)
        return bot.reply(message, `*${coinInfo.id} = ${parseFloat(coinInfo.rateUsd, 10).toFixed(2)} USD* _Price from coincap.io API_`)
      })
      .catch(err => {
        logError('caught', err)
        return bot.reply(message, 'Error - servidor falló')
      })
  }
}

module.exports = coinPrice
