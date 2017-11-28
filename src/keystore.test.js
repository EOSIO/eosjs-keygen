/* eslint-env mocha */
const assert = require('assert')
const {accountPermissions, checkKeySet} = require('./test-utils.js')
const {PrivateKey} = require('eosjs-ecc')
const config = require('./config')

const Keystore = require('./keystore.js')

let pathname = '/'
let historyListener

config.history = {
  get location() {
    return { pathname, search: '', hash: '' }
  },
  get listen() {
    return callback => {
      historyListener = callback
    }
  }
}

let keystore
function reset() {
  if(keystore) {
    keystore.logout()
  } else {
    Keystore.wipeAll()
  }
}

describe('Keystore', () => {
  beforeEach(() => {
    reset()
  })

  afterEach(() => {
    reset()
  })

  it('create', () => {
    Keystore('uid')
  })

  it('deriveKeys', () => {
    const pw = 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'
    const keystore = Keystore('uid')
    keystore.deriveKeys(pw, 'active/**', accountPermissions)
  })

  it('save disk security', () => {
    keystore = Keystore('myaccount')

    const disk = true
    const privateKey = PrivateKey.randomKey(0)
    const save = path => keystore.addKey(path, privateKey, disk)

    assert.throws(() => {save('owner')}, /not be stored on disk/)
    assert.throws(() => {save('owner/cold')}, /not be stored on disk/)

    assert.throws(() => {save('active')}, /not be stored on disk/)
    assert.doesNotThrow(() => {save('active/mypermission')})
  })

  it('save key', () => {
    keystore = Keystore('myaccount')
    const save = key => keystore.addKey('owner', key)

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
    keystore = Keystore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    assert.deepEqual(keystore.addKey('owner', wif), {wif, pubkey})
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner'],
      wif: ['owner']
    })
    assert.deepEqual(keystore.getPublicKeys('owner'), [pubkey])
    assert.deepEqual(keystore.getPrivateKeys('owner'), [wif])

    // keep the owner key above, add public key active/mypermission
    assert.deepEqual(keystore.addKey('active/mypermission', pubkey), {
      wif: null,
      pubkey
    })
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner', 'active/mypermission'],
      wif: ['owner']
    })

    // add the private key for active/mypermission
    assert.deepEqual(keystore.addKey('active/mypermission', wif), {
      pubkey,
      wif
    })

    // now we have everything: owner, active/mypermission
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner', 'active/mypermission'],
      wif: ['owner', 'active/mypermission']
    })
  })

  it('removeKey', () => {
    keystore = Keystore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    assert.deepEqual(keystore.addKey('owner', wif), {wif, pubkey})

    keystore.removeKey('owner', true/*keepPublicKeys*/)
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['owner'],
      wif: []
    })

    keystore.removeKey(new Set(['owner']), false/*keepPublicKeys*/)
    assert.deepEqual(keystore.getKeyPaths(), {pubkey: [], wif: []})
  })

  it('initialize from disk', () => {
    keystore = Keystore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    keystore.addKey('active/mypermission', wif, true/*disk*/)

    keystore = Keystore('myaccount')
    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: ['active/mypermission'],
      wif: ['active/mypermission']
    })
  })

  it('wipe all', () => {
    keystore = Keystore('myaccount')
    keystore.addKey('active/mypermission', PrivateKey.randomKey(0), true/*disk*/)

    Keystore.wipeAll()

    keystore = Keystore('myaccount')
    assert.deepEqual(keystore.getKeyPaths(), {pubkey: [], wif: []})
  })

  it('wipe user', () => {
    keystore = Keystore('myaccount')

    const privateKey = PrivateKey.randomKey(0)
    const wif = privateKey.toWif()
    const pubkey = privateKey.toPublic().toString()

    keystore.addKey('active/mypermission', wif, true/*disk*/)

    keystore.logout()

    assert.deepEqual(keystore.getKeyPaths(), {
      pubkey: [],
      wif: []
    })

    const keyPathStore2 = Keystore('myaccount')
    assert.deepEqual(keyPathStore2.getKeyPaths(), {
      pubkey: [],
      wif: []
    })
  })

})