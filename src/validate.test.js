/* eslint-env mocha */
const assert = require('assert')

const validate = require('./validate')

describe('Validate', () => {

  it('path', () => {
    validate.path('master') // better error than doesNotThrow
    assert.doesNotThrow(() => validate.path('master'))
    assert.doesNotThrow(() => validate.path('owner'))
    assert.doesNotThrow(() => validate.path('owner/active'))
    assert.doesNotThrow(() => validate.path('owner/myaccount/mypermission'))
    assert.doesNotThrow(() => validate.path('myaccount'))
    assert.doesNotThrow(() => validate.path('myaccount/mypermission'))
    assert.throws(() => validate.path('active'), /active is implied or a child of owner/)
    assert.throws(() => validate.path('active/mykey'), /active is implied/)
    assert.throws(() => validate.path('master/owner'), /master is an implied root/)
    assert.throws(() => validate.path('myaccount/owner'), /owner is always the root/)
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