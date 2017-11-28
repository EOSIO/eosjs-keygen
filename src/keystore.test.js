/* eslint-env mocha */
const assert = require('assert')
const Keystore = require('./keystore.js')
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

describe('Keystore', () => {
  afterEach(() => {
    Keystore.wipeAll()
  })

  it('generateMasterKeys', (done) => {
    Keystore.generateMasterKeys(0).then(keys => {
      checkKeySet(keys)
      done()
    })
  })

  it('constructor', () => {
    Keystore('uid')
  })

  it('login', () => {
    const pw = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keystore = Keystore('uid')
    keystore.deriveKeys(pw, 'active/**', accountPermissions)
  })

  // it('getEosKeys', () => {
  //   const testPrivate = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
  //   const keys = gen.getEosKeys(testPrivate)
  //   checkKeySet(keys)
  // })

})

