/* eslint-env mocha */
const assert = require('assert')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

const {PrivateKey} = require('eosjs-ecc')
const Keygen = require('./keygen')

describe('Keygen', () => {
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
  
  it('genKeys (create)', () => {
    const keys = Keygen.genKeys(null, 0)
    checkKeySet(keys)
  })

  it('genKeys (re-construct)', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keys = Keygen.genKeys(master, 0)
    checkKeySet(keys)
  })

  it('deriveKeys', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keys = Keygen.genKeys(master, 0)

    const wifsByPath = {
      owner: keys.privateKeys.owner,
      active: keys.privateKeys.active,
    }

    const derivedKeys = Keygen.deriveKeys('active/mypermission', wifsByPath)
    const active = PrivateKey(keys.privateKeys.active)
    const checkKey = active.getChildKey('mypermission').toWif()

    assert.equal(derivedKeys.length, 1, 'derived key count')
    assert.equal(derivedKeys[0].path, 'active/mypermission')
    assert.equal(derivedKeys[0].privateKey.toWif(), checkKey, 'wrong private key')
  })

})
