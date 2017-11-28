/* eslint-env mocha */
const assert = require('assert')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

const {PrivateKey} = require('eosjs-ecc')
const Keygen = require('./keygen')

describe('Generate', () => {
  it('generateMasterKeys', (done) => {
    Keygen.generateMasterKeys(0).then(keys => {
      checkKeySet(keys)
      done()
    })
  })

  it('authsByPath', () => {
    const paths = Keygen.authsByPath(accountPermissions)
    assert.deepEqual(
      ['active', 'active/mypermission', 'owner'],
      Object.keys(paths)
    )
  })

  it('keysByPath', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keyPathPrivateKey = Keygen.keysByPath(master, accountPermissions)
    // console.log('keyPathPrivateKey', keyPathPrivateKey)
  })

  it('genKeys (create)', () => {
    const keys = Keygen.genKeys(null, 0)
    checkKeySet(keys)
  })

  it('genKeys (re-construct)', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keys = Keygen.genKeys(master, 0)
    checkKeySet(keys)
  })
})
