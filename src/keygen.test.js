/* eslint-env mocha */
const assert = require('assert')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

const {PrivateKey} = require('eosjs-ecc')
const keygen = require('./keygen')

describe('Generate', () => {
  it('authsByPath', () => {
    const paths = keygen.authsByPath(accountPermissions)
    assert.deepEqual(
      ['active', 'active/mypermission', 'owner'],
      Object.keys(paths)
    )
  })

  it('keysByPath', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keyPathPrivateKey = keygen.keysByPath(master, accountPermissions)
    // console.log('keyPathPrivateKey', keyPathPrivateKey)
  })

  it('genKeys (create)', () => {
    const keys = keygen.genKeys(null, 0)
    checkKeySet(keys)
  })

  it('genKeys (re-construct)', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keys = keygen.genKeys(master, 0)
    checkKeySet(keys)
  })
})
