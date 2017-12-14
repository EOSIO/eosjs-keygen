/* eslint-env mocha */
const assert = require('assert')
const {accountPermissions, checkKeySet} = require('./test-utils.js')

const {PrivateKey} = require('eosjs-ecc')
const Keygen = require('./keygen')

describe('Keygen', () => {
  it('initialize', () => PrivateKey.initialize())
  
  it('generateMasterKeys (create)', () => {
    return Keygen.generateMasterKeys().then(keys => {
      checkKeySet(keys)
    })
  })

  it('generateMasterKeys (re-construct)', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    return Keygen.generateMasterKeys(master).then(keys => {
      assert.equal(keys.masterPrivateKey, master, 'masterPrivateKey')
      checkKeySet(keys)
    })
  })

  it('authsByPath', () => {
    const paths = Keygen.authsByPath(accountPermissions)
    assert.deepEqual(
      ['active', 'active/mypermission', 'owner'],
      Object.keys(paths)
    )
  })

  it('deriveKeys', () => {
    const master = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    return Keygen.generateMasterKeys(master).then(keys => {
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
})
