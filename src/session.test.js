/* eslint-env mocha */
const assert = require('assert')
const Session = require('.')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

describe('Session', () => {

  it('generateMasterKeys', () => {
    const keys = Session.generateMasterKeys(0)
    checkKeySet(keys)
  })

  it('constructor', () => {
    Session('uid')
  })
  
  it('login', () => {
    Session('uid')
  })

  // it('getEosKeys', () => {
  //   const testPrivate = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
  //   const keys = gen.getEosKeys(testPrivate)
  //   checkKeySet(keys)
  // })

})

