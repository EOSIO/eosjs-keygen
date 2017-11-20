/* eslint-env mocha */
const assert = require('assert')

const validate = require('./validate')

describe('Validate', () => {

  it('path', () => {
    validate.path('owner') // better error than doesNotThrow
    assert.doesNotThrow(() => validate.path('owner'))
    assert.doesNotThrow(() => validate.path('owner/active'))
    assert.doesNotThrow(() => validate.path('active/mypermission'))
    assert.doesNotThrow(() => validate.path('active'))
    assert.doesNotThrow(() => validate.path('active/mykey'))
    assert.throws(() => validate.path('active/mykey/active'), /duplicate/)
    assert.throws(() => validate.path('active/owner'), /owner is always the root/)
    assert.throws(() => validate.path('owner/mykey/active'), /active is always first or second/)
  })

  it('keyType', () => {
    const testPubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
    const testMasterPass = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const testPrivate = testMasterPass.substring(2)

    assert.equal('pubkey', validate.keyType(testPubkey))
    assert.equal('master', validate.keyType(testMasterPass))
    assert.equal('wif', validate.keyType(testPrivate))
    assert.equal(null, validate.keyType(testPrivate.substring(1)))
  })

})