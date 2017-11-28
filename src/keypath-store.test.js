/* eslint-env mocha */
const assert = require('assert')
const {PrivateKey} = require('eosjs-ecc')

const KeypathStore = require('./keypath-store')

describe('Keypath Store', () => {

  beforeEach(() => {
    KeypathStore.wipeAll()
  })

  afterEach(() => {
    KeypathStore.wipeAll()
  })

  it('save disk security', () => {
    const keypathStore = KeypathStore('myaccount')

    const disk = true
    const privateKey = PrivateKey.randomKey(0)
    const save = path => keypathStore.save(path, privateKey, disk)

    assert.throws(() => {save('owner')}, /not be stored on disk/)
    assert.throws(() => {save('owner/cold')}, /not be stored on disk/)

    assert.throws(() => {save('active')}, /not be stored on disk/)
    assert.doesNotThrow(() => {save('active/mypermission')})
  })

  it('save key', () => {
    const keypathStore = KeypathStore('myaccount')
    const save = key => keypathStore.save('owner', key)

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
    const keypathStore = KeypathStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    assert.deepEqual(keypathStore.save('owner', wif), {wif, pubkey})
    assert.deepEqual(keypathStore.getKeyPaths(), {
      pubkey: ['owner'],
      wif: ['owner']
    })
    assert.deepEqual(keypathStore.getPublicKeys('owner'), [pubkey])
    assert.deepEqual(keypathStore.getPrivateKeys('owner'), [wif])

    // keep the owner key above, add public key active/mypermission
    assert.deepEqual(keypathStore.save('active/mypermission', pubkey), {
      wif: null,
      pubkey
    })
    assert.deepEqual(keypathStore.getKeyPaths(), {
      pubkey: ['owner', 'active/mypermission'],
      wif: ['owner']
    })

    // add the private key for active/mypermission
    assert.deepEqual(keypathStore.save('active/mypermission', wif), {
      pubkey,
      wif
    })

    // now we have everything: owner, active/mypermission
    assert.deepEqual(keypathStore.getKeyPaths(), {
      pubkey: ['owner', 'active/mypermission'],
      wif: ['owner', 'active/mypermission']
    })
  })

  it('remove', () => {
    const keypathStore = KeypathStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    assert.deepEqual(keypathStore.save('owner', wif), {wif, pubkey})

    keypathStore.remove('owner', true/*keepPublicKeys*/)
    assert.deepEqual(keypathStore.getKeyPaths(), {
      pubkey: ['owner'],
      wif: []
    })

    keypathStore.remove(new Set(['owner']), false/*keepPublicKeys*/)
    assert.deepEqual(keypathStore.getKeyPaths(), {
      pubkey: [],
      wif: []
    })
  })

  it('Initialize from disk', () => {
    const keypathStore = KeypathStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    keypathStore.save('active/mypermission', wif, true/*disk*/)

    const keyPathStore2 = KeypathStore('myaccount')
    assert.deepEqual(keyPathStore2.getKeyPaths(), {
      pubkey: ['active/mypermission'],
      wif: ['active/mypermission']
    })
  })

  it('wipe user', () => {
    const keypathStore = KeypathStore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    keypathStore.save('active/mypermission', wif, true/*disk*/)

    keypathStore.wipeUser()

    assert.deepEqual(keypathStore.getKeyPaths(), {
      pubkey: [],
      wif: []
    })

    const keyPathStore2 = KeypathStore('myaccount')
    assert.deepEqual(keyPathStore2.getKeyPaths(), {
      pubkey: [],
      wif: []
    })
  })

})