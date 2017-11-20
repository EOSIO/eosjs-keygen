const Session = require('./session')
const config = require('./config')

const createHistory = require('history').createBrowserHistory 
config.history = createHistory()
config.localStorage = localStorage

module.exports = Session
