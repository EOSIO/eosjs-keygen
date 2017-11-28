const assert = require('assert')
const {localStorage} = require('./config')

const ecc = require('eosjs-ecc')
const userStorage = require('./storage-utils')('ustor')
const validate = require('./validate')

/**
  Storage for private and public keys.

  This keystore does not query the blockchain or any external services.
  Removing keys here does not affect the blockchain.
*/
module.exports = KeyStore

function KeyStore(accountName) {
  assert.equal(typeof accountName, 'string', 'accountName')

  /** @private */
  const state = {}

  // Initialize state from localStorage
  userStorage.query(localStorage, [accountName, 'kpath'], ([type, path], value) => {
    const key = userStorage.createKey(accountName, 'kpath', type, path)
    console.log('key', key)
    state[key] = value
  })

  /**
    Save a private or public key to the store in either RAM only or RAM and
    disk. Prevents certain key types from being saved on disk.

    @arg {keyPath} path - active/mypermission, owner, active, ..
    @arg {string} key - wif, pubkey, or privateKey
    @arg {boolean} disk - save to persistent storage (localStorage)

    @throws {AssertionError} path error or active, owner/* disk save attempted

    @return {{wif, pubkey}}
  */
  function save(path, key, disk = false) {
    validate.path(path)

    const keyType = validate.keyType(key)
    assert(/^wif|pubkey|privateKey$/.test(keyType),
      'key should be a wif, public key string, or privateKey object')
  
    if(disk) {
      assert(path !== 'owner', 'owner key should not be stored on disk')
      assert(path.indexOf('owner/') !== 0,
        'owner derived keys should not be stored on disk')

      assert(path !== 'active', 'active key should not be stored on disk')
    }

    const wif =
      keyType === 'wif' ? key :
      keyType === 'privateKey' ? ecc.PrivateKey(key).toWif() :
      null

    const pubkey =
      keyType === 'pubkey' ? ecc.PublicKey(key).toString() :
      keyType === 'privateKey' ? key.toPublic().toString() :
      ecc.privateToPublic(wif)
  
    const userKeyWif = userStorage.createKey(accountName, 'kpath', 'wif', path)
    const userKeyPub = userStorage.createKey(accountName, 'kpath', 'pubkey', path)

    userStorage.save(state, userKeyWif, wif)
    userStorage.save(state, userKeyPub, pubkey)

    if(disk) {
      userStorage.save(localStorage, userKeyWif, wif)
      userStorage.save(localStorage, userKeyPub, pubkey)
    }
    return {wif, pubkey}
  }

  /**
    Return paths for all available keys.  An empty Set is used if there are
    no keys.

    @return {object} {pubkey: Array<pubkey>, wif: Array<wif>}
  */
  function getKeyPaths() {
    const pubkey = new Set()
    const wif = new Set()

    function queryUserStore(store, accountName, pubkey, wif) {
      userStorage.query(store, [accountName, 'kpath'], ([type, path], value) => {
        if(type === 'pubkey' && value != null) {
          pubkey.add(path)
        } else if(type === 'wif' && value != null) {
          wif.add(path)
        } else if(value != null) {
          console.log('WARN: unknown key type, ' + type)
        }
      })
    }

    queryUserStore(state, accountName, pubkey, wif)
    queryUserStore(localStorage, accountName, pubkey, wif)

    return {pubkey: Array.from(pubkey), wif: Array.from(wif)}
  }

  /**
    @arg {keyPath}
    @return {pubkey} public key or null
  */
  function getPublicKey(path) {
    validate.path(path)
    const userKeyPub = userStorage.createKey(accountName, 'kpath', 'pubkey', path)
    return state[userKeyPub] ? state[userKeyPub] : localStorage[userKeyPub]
  }

  /**
    Return or derive a private key.
    @arg {keyPath}
    @return {wif} null
  */
  function getPrivateKey(path) {
    validate.path(path)
    const userKeyWif = userStorage.createKey(accountName, 'kpath', 'wif', path)
    return state[userKeyWif] ? state[userKeyWif] : localStorage[userKeyWif]
  }

  /**
    Remove a key or keys from this key store (ram and disk).

    @arg {keyPath|Array<keyPath>|Set<keyPath>}

    @arg {boolean} keepPublicKeys - Enable for better UX; show users keys they
    have access too without requiring them to login. Logging in brings a
    private key online which is not necessary to see public information.

    The UX should implement this behavior in a way that is clear public keys
    are cached before enabling this feature.
  */
  function remove(paths, keepPublicKeys = false) {
    // console.log('keystore ==> remove paths', paths)

    if(typeof paths === 'string') {
      paths = [paths]
    }
    assert(paths instanceof Array || paths instanceof Set, 'paths is a Set or Array')
    for(const path of paths) {
      validate.path(path)
    }

    for(const path of paths) {
      const userKeyWif = userStorage.createKey(accountName, 'kpath', 'wif', path)
      state[userKeyWif] = null
      localStorage[userKeyWif] = null

      if(!keepPublicKeys) {
        const userKeyPub = userStorage.createKey(accountName, 'kpath', 'pubkey', path)
        state[userKeyPub] = null
        localStorage[userKeyPub] = null
      }
    }
  }

  /** Erase all keys on disk for this user. */
  function wipeUser() {
    for(const key in state) {
      delete state[key]
    }

    const prefix = userStorage.createKey(accountName, 'kpath')
    for(const key in localStorage) {
      if(key.indexOf(prefix) === 0) {
        delete localStorage[key]
      }
    }
  }

  return {
    save,
    getKeyPaths,
    getPublicKey,
    getPrivateKey,
    remove,
    wipeUser
  }
}

/** Erase all traces of this KeyStore (for all users).  */
KeyStore.wipeAll = function() {
  const prefix = userStorage.createKey()
  for(const key in localStorage) {
    if(key.indexOf(prefix) === 0) {
      delete localStorage[key]
    }
  }
}
