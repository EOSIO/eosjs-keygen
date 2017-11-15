const assert = require('assert')
const localStorage = require('localStorage')

const ecc = require('eosjs-ecc')
const userStorage = require('./storage-utils')('ustor')
const validate = require('./validate')

/**
  Rules and storage for private keys.
*/
module.exports = Store

function Store(userId) {
  assert.equal('string', typeof userId, 'userId')

  /** @private */
  let state = {}

  /**
    Save a private or public key to the store in either RAM only or RAM and
    disk. Prevents certain key types from being saved on disk.

    @arg {string} path - myaccount/mypermission, owner, owner/active
    @arg {string|array} key - wif, pubkey, or PrivateKey
    @arg {boolean} disk - save to local storage

    @throws {AssertionError} path error or owner/* disk save attempted
  */
  function save(path, key, disk = false) {
    validate.path(path)
    assert(path !== 'master', 'master key should not be saved anywhere')

    const keyType = validate.keyType(key)
    assert(/^wif|pubkey|PrivateKey$/.test(keyType),
      'key should be a wif, public key string, or privateKey object')
  
    if(disk) {
      assert(path !== 'owner', 'owner key should not be stored on disk')
      assert(path.indexOf('owner/') === 0,
        'owner derived keys should not be stored on disk')
    }

    const wif =
      keyType === 'wif' ? key :
      keyType === 'privateKey' ? key.toWif() :
      null

    const pubkey =
      keyType === 'pubkey' ? key :
      keyType === 'privateKey' ? key.toPublic().toString() :
      ecc.privateToPublic(wif)
  
    const userKeyWif = userStorage.key(userId, 'wif', path)
    const userKeyPub = userStorage.key(userId, 'pubkey', path)

    userStorage.save(state, userKeyWif, wif)
    userStorage.save(state, userKeyPub, pubkey)

    if(disk) {
      userStorage.save(localStorage, userKeyWif, wif)
      userStorage.save(localStorage, userKeyPub, pubkey)
    }
  }

  /**
    Remove a key from ram and disk.

    @arg {boolean} keepPublicKey - (true) Can lead to better UX by showing users
      keys they have access too without requiring them to login and bringing a
      private key online.  The UX should make this behavior clear to users
      before turning this on.
  */
  function remove(path, keepPublicKey = false) {
    validate.path(path)

    const userKeyWif = userStorage.key(userId, 'wif', path)
    state[userKeyWif] = null
    localStorage[userKeyWif] = null

    if(!keepPublicKey) {
      const userKeyPub = userStorage.key(userId, 'pubkey', path)
      state[userKeyPub] = null
      localStorage[userKeyPub] = null
    }
  }

  /**
    @example getPublicKey('owner')
    @example getPublicKey('owner/active')
    @example getPublicKey('myaccount/mypermission')

    @return {string} public key or null
  */
  function getPublicKey(path) {
    validate.path(path)
    const userKeyPub = userStorage.key(userId, 'pubkey', path)
    return state[userKeyPub] ? state[userKeyPub] : localStorage[userKeyPub]
  }

  /**
    Return or derive a private key.  

    @example getPrivateKey('owner')
    @example getPrivateKey('owner/active')
    @example getPrivateKey('myaccount/mypermission')

    @return {string} wif or null
  */
  function getPrivateKey(path) {
    validate.path(path)
    const userKeyWif = userStorage.key(userId, 'wif', path)
    return state[userKeyPub] ? state[userKeyPub] : localStorage[userKeyPub]
  }

  /**
    @return {Set<string>} paths for all available public keys (or empty array)
  */
  function getPublicKeyPaths() {
    const paths = new Set()
    userStorage.query(localStorage, [userId, 'pubkey'], ([path]) => {
      paths.add(path)
    })
    userStorage.query(state, [userId, 'pubkey'], ([path]) => {
      paths.add(path)
    })
    return paths
  }

  /**
    @return {Set<string>} paths for all available private keys (or empty array)
  */
  function getPrivateKeyPaths() {
    const paths = new Set()
    userStorage.query(localStorage, [userId, 'wif'], ([path]) => {
      paths.add(path)
    })
    userStorage.query(state, [userId, 'wif'], ([path]) => {
      paths.add(path)
    })
    return paths
  }

  /** Erase Session (RAM) keys for this user. */
  function wipeSession() {
    state = {}
  }

  /** Erase all keys for this user. */
  function wipeUser() {
    state = {}
    const prefix = userStorage.key(userId)
    for(const key in localStorage) {
      if(key.indexOf(prefix) === 0) {
        delete localStorage[key]
      }
    }
  }

  return {
    save,
    remove,
    getPublicKey,
    getPrivateKey,
    getPublicKeyPaths,
    getPrivateKeyPaths,
    wipeSession,
    wipeUser
  }
}

/** Erase all traces of this KeyStore (for all users).  */
Store.wipeAll = function() {
  const prefix = userStorage.key()
  for(const key in localStorage) {
    if(key.indexOf(prefix) === 0) {
      delete localStorage[key]
    }
  }
}
