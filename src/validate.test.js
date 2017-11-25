/* eslint-env mocha */
const assert = require('assert')

const validate = require('./validate')

describe('Validate', () => {

  it('path', () => {
    validate.path('owner') // better error than doesNotThrow
    assert.doesNotThrow(() => validate.path('owner'))
    assert.doesNotThrow(() => validate.path('active'))
    assert.doesNotThrow(() => validate.path('active/mypermission'))
    assert.doesNotThrow(() => validate.path('active'))
    assert.doesNotThrow(() => validate.path('active/mykey'))

    assert.throws(() => validate.path('active/mykey/active'), /duplicate/)
    assert.throws(() => validate.path('owner/active'), /owner is implied, juse use active/)
    assert.throws(() => validate.path('joe/active'), /path should start with owner or active/)
    assert.throws(() => validate.path('owner/mykey/active'), /active is always first/)
    assert.throws(() => validate.path('active/mykey/owner'), /owner is always first/)
    assert.throws(() => validate.path('active/owner'), /owner is always first/)
  })

  it('keyType', () => {
    const testPubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
    const testMasterPass = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const testPrivate = testMasterPass.substring(2)

    assert.equal(validate.keyType(testPubkey), 'pubkey')
    assert.equal(validate.keyType(testMasterPass), 'master')
    assert.equal(validate.keyType(testPrivate), 'wif')
    assert.equal(validate.keyType(testPrivate.substring(1)), null)
  })

  it('isMasterKey', () => {
    const testMasterPass = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    assert(validate.isMasterKey(testMasterPass))
    assert(!validate.isMasterKey(testMasterPass + 'a'))
  })

})