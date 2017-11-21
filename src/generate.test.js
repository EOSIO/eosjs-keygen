/* eslint-env mocha */
const assert = require('assert')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

const {PrivateKey} = require('eosjs-ecc')
const generate = require('./generate')

describe('Generate', () => {
  it('authsByPath', () => {
    const paths = generate.authsByPath(accountPermissions)
    assert.deepEqual(
      ['owner/active', 'active/mypermission', 'owner'],
      Object.keys(paths)
    )
  })

  it('keysByPath', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    generate.keysByPath(master, accountPermissions)
  })

  it('keyGen', () => {
    const keys = generate.genKeys(PrivateKey.randomKey(0))
    checkKeySet(keys)
  })

  // it('getEosKeys', () => {
  //   const testPrivate = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
  //   const keys = gen.getEosKeys(testPrivate)
  //   checkKeySet(keys)
  // })

})
