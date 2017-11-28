const Keystore = require('./keystore')

const createHistory = require('history').createBrowserHistory
const config = require('./config')

config.history = createHistory()
config.localStorage = localStorage

module.exports = Keystore
