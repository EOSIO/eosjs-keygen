const assert = require('assert')
const {localStorage} = require('./config')

const ecc = require('eosjs-ecc')
const userStorage = require('./storage-utils')('kstor')
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
  userStorage.query(localStorage, [accountName, 'kpath'], ([path, pubkey], wif) => {
    const storageKey = userStorage.createKey(accountName, 'kpath', path, pubkey)
    state[storageKey] = wif
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
  
    assert(!!pubkey, 'pubkey')

    const storageKey = userStorage.createKey(accountName, 'kpath', path, pubkey)

    userStorage.save(state, storageKey, wif)
    if(disk) {
      userStorage.save(localStorage, storageKey, wif)
    }
    return {wif, pubkey}
  }

  /**
    Return paths for all available keys.  An empty Set is used if there are
    no keys.

    @return {object} {pubkey: Array<pubkey>, wif: Array<wif>}
  */
  function getKeyPaths() {
    const pubs = new Set()
    const wifs = new Set()

    function query(store) {
      userStorage.query(store, [accountName, 'kpath'], ([path, pubkey], wif) => {
        pubs.add(path)
        if(wif != null) {
          wifs.add(path)
        }
      })
    }

    query(state)
    query(localStorage)

    return {pubkey: Array.from(pubs), wif: Array.from(wifs)}
  }

  /**
    @arg {keyPath}
    @return {Array<pubkey>} public key, keys, or empty array
  */
  function getPublicKeys(path) {
    return getKeys(path).pubkey
  }

  /**
    Return private key for a path.
    @arg {keyPath}
    @return {wif} null
  */
  function getPrivateKeys(path) {
    return getKeys(path).wif
  }

  /**
    @arg {keyPath}
    @return {object} {pubkey: Array<pubkey>, wif: Array<wif>} or empty arrays
  */
  function getKeys(path) {
    validate.path(path)

    const pubs = new Set()
    const wifs = new Set()

    function query(store) {
      userStorage.query(store, [accountName, 'kpath'], ([path, pubkey], wif) => {
        pubs.add(pubkey)
        if(wif != null) {
          wifs.add(wif)
        }
      })
    }

    query(state)
    query(localStorage)

    return {pubkey: Array.from(pubs), wif: Array.from(wifs)}
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
    
    function clean(store, prefix) {
      for(const key in store) {
        if(key.indexOf(prefix) === 0) {
          if(keepPublicKeys) {
            store[key] = null
          } else {
            delete store[key]
          }
        }
      }
    }

    for(const path of paths) {
      const prefix = userStorage.createKey(accountName, 'kpath', path)
      clean(state, prefix)
      clean(localStorage, prefix)
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
    getPublicKeys,
    getPrivateKeys,
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
