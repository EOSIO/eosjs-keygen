/* eslint-env mocha */
const assert = require('assert')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

const {PrivateKey} = require('eosjs-ecc')
const generate = require('./generate')

describe('Generate', () => {
  it('authsByPath', () => {
    const paths = generate.authsByPath(accountPermissions)
    assert.deepEqual(
      ['active', 'active/mypermission', 'owner'],
      Object.keys(paths)
    )
  })

  it('keysByPath', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keyPathPrivateKey = generate.keysByPath(master, accountPermissions)
    // console.log('keyPathPrivateKey', keyPathPrivateKey)
  })

  it('genKeys (create)', () => {
    const keys = generate.genKeys(null, 0)
    checkKeySet(keys)
  })

  it('genKeys (re-construct)', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keys = generate.genKeys(master, 0)
    checkKeySet(keys)
  })
})
