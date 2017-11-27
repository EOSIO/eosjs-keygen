/* eslint-env mocha */
const assert = require('assert')
const {PrivateKey} = require('eosjs-ecc')

const KeyStore = require('./keystore')

describe('Store', () => {

  it('wipeAll', () => {
    KeyStore.wipeAll()
  })

  it('save disk security', () => {
    const keyStore = KeyStore('myaccount')

    const disk = true
    const privateKey = PrivateKey.randomKey(0)
    const save = path => keyStore.save(path, privateKey, disk)

    assert.throws(() => {save('owner')}, /not be stored on disk/)
    assert.throws(() => {save('owner/cold')}, /not be stored on disk/)

    assert.throws(() => {save('active')}, /not be stored on disk/)
    assert.doesNotThrow(() => {save('active/mypermission')})
  })

  it('save key types', () => {
    const keyStore = KeyStore('myaccount')
    const save = key => keyStore.save('owner', key)

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const publicKey = privateKey.toPublic()
    const pubkey = publicKey.toString()

    assert.deepEqual(save(privateKey), {wif, pubkey})
    assert.deepEqual(save(wif), {wif, pubkey})
    assert.deepEqual(save(publicKey), {wif: null, pubkey})
    assert.deepEqual(save(pubkey), {wif: null, pubkey})
  })

  it('remove keys', () => {

  })

})