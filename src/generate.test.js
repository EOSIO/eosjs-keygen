/* eslint-env mocha */
const assert = require('assert')

const gen = require('./generate')

describe('Generate', () => {

  function checkKeySet(keys) {
    assert.equal('string', typeof keys.masterPrivateKey, 'keys.masterPrivateKey')

    assert.equal('object', typeof keys.privateKeys, 'keys.privateKeys')
    assert.equal('string', typeof keys.privateKeys.owner, 'keys.privateKeys.owner')
    assert.equal('string', typeof keys.privateKeys.active, 'keys.privateKeys.active')

    assert.equal('object', typeof keys.publicKeys, 'keys.publicKeys')
    assert.equal('string', typeof keys.publicKeys.owner, 'keys.publicKeys.owner')
    assert.equal('string', typeof keys.publicKeys.active, 'keys.publicKeys.active')
  }

  it('generateMasterKeys', () => {
    const keys = gen.generateMasterKeys(0)
    checkKeySet(keys)
  })

  it('generateMasterKeys', () => {
    const testPrivate = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keys = gen.getEosKeys(testPrivate)
    checkKeySet(keys)
  })

  it('validPath', () => {
    assert.doesNotThrow(() => gen.validPath('owner'))
    assert.doesNotThrow(() => gen.validPath('owner'))
    assert.throws(() => gen.validPath('active'), /Active is a child key of owner/)
    assert.doesNotThrow(() => gen.validPath('owner/active'))
    assert.doesNotThrow(() => gen.validPath('myaccount'))
    assert.doesNotThrow(() => gen.validPath('myaccount/mypermission'))
  })

  it('keyType', () => {
    const testPrivate = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    assert.equal('master', gen.keyType(testPrivate))
    assert.equal('wif', gen.keyType(testPrivate.substring(2)))
    assert.equal(null, gen.keyType(testPrivate.substring(3)))
  })

})