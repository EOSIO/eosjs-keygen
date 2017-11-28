/* eslint-env mocha */
const assert = require('assert')
const {PrivateKey} = require('eosjs-ecc')

const KeyStore = require('./keystore')

describe('Store', () => {

  beforeEach(() => {
    KeyStore.wipeAll()
  })

  afterEach(() => {
    KeyStore.wipeAll()
  })

  it('save disk security', () => {
    const keystore = KeyStore('myaccount')

    const disk = true
    const privateKey = PrivateKey.randomKey(0)
    const save = path => keystore.save(path, privateKey, disk)

    assert.throws(() => {save('owner')}, /not be stored on disk/)
    assert.throws(() => {save('owner/cold')}, /not be stored on disk/)

    assert.throws(() => {save('active')}, /not be stored on disk/)
    assert.doesNotThrow(() => {save('active/mypermission')})
  })

  it('save key', () => {
    const keystore = KeyStore('myaccount')
    const save = key => keystore.save('owner', key)

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const publicKey = privateKey.toPublic()
    const pubkey = publicKey.toString()

    assert.deepEqual(save(privateKey), {wif, pubkey})
    assert.deepEqual(save(wif), {wif, pubkey})
    assert.deepEqual(save(publicKey), {wif: null, pubkey})
    assert.deepEqual(save(pubkey), {wif: null, pubkey})
  })

  it('save and get keys', () => {
    const keystore = KeyStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    assert.deepEqual(keystore.save('owner', wif), {wif, pubkey})
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner'],
      wif: ['owner']
    })
    assert.deepEqual(keystore.getPublicKeys('owner'), [pubkey])
    assert.deepEqual(keystore.getPrivateKeys('owner'), [wif])

    // keep the owner key above, add public key active/mypermission
    assert.deepEqual(keystore.save('active/mypermission', pubkey), {
      wif: null,
      pubkey
    })
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner', 'active/mypermission'],
      wif: ['owner']
    })

    // add the private key for active/mypermission
    assert.deepEqual(keystore.save('active/mypermission', wif), {
      pubkey,
      wif
    })

    // now we have everything: owner, active/mypermission
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner', 'active/mypermission'],
      wif: ['owner', 'active/mypermission']
    })
  })

  it('remove', () => {
    const keystore = KeyStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    assert.deepEqual(keystore.save('owner', wif), {wif, pubkey})

    keystore.remove('owner', true/*keepPublicKeys*/)
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner'],
      wif: []
    })

    keystore.remove(new Set(['owner']), false/*keepPublicKeys*/)
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: [],
      wif: []
    })
  })

  it('Initialize from disk', () => {
    const keystore = KeyStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    keystore.save('active/mypermission', wif, true/*disk*/)

    const keystore2 = KeyStore('myaccount')
    assert.deepEqual(keystore2.getKeyPaths(), {
      pubkey: ['active/mypermission'],
      wif: ['active/mypermission']
    })
  })

  it('wipe user', () => {
    const keystore = KeyStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    keystore.save('active/mypermission', wif, true/*disk*/)

    keystore.wipeUser()

    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: [],
      wif: []
    })

    const keystore2 = KeyStore('myaccount')
    assert.deepEqual(keystore2.getKeyPaths(), {
      pubkey: [],
      wif: []
    })
  })

})