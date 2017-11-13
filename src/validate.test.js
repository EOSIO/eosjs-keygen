/* eslint-env mocha */
const assert = require('assert')

const validate = require('./validate')

describe('Validate', () => {

  it('path', () => {
    validate.path('owner')
    assert.doesNotThrow(() => validate.path('owner'))
    assert.doesNotThrow(() => validate.path('owner'))
    assert.throws(() => validate.path('active'), /Active is a child key of owner/)
    assert.doesNotThrow(() => validate.path('owner/active'))
    assert.doesNotThrow(() => validate.path('myaccount'))
    assert.doesNotThrow(() => validate.path('myaccount/mypermission'))
  })

  it('keyType', () => {
    const testPrivate = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    assert.equal('master', validate.keyType(testPrivate))
    assert.equal('wif', validate.keyType(testPrivate.substring(2)))
    assert.equal(null, validate.keyType(testPrivate.substring(3)))
  })

})