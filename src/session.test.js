/* eslint-env mocha */
const assert = require('assert')
const Session = require('.')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

const config = require('./config')

let pathname = '/'
let historyListener

config.history = {
  get location() {
    return { pathname, search: '', hash: '' }
  },
  get listen() {
    return callback => {
      historyListener = callback
    }
  }
}

describe('Session', () => {
  afterEach(() => {
    Session.wipeAll()
  })

  it('generateMasterKeys', () => {
    const keys = Session.generateMasterKeys(0)
    checkKeySet(keys)
  })

  it('constructor', () => {
    Session('uid')
  })

  it('login', () => {
    const pw = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    session = Session('uid')
    session.login(pw, accountPermissions, 'active/**')
  })

  // it('getEosKeys', () => {
  //   const testPrivate = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
  //   const keys = gen.getEosKeys(testPrivate)
  //   checkKeySet(keys)
  // })

})

