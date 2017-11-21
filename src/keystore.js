const assert = require('assert')
const localStorage = require('./config').localStorage

const ecc = require('eosjs-ecc')
const userStorage = require('./storage-utils')('ustor')
const validate = require('./validate')

/**
  Rules and storage for private keys.

  This keyStore does not query the blockchain or any external services.  Removing
  keys here does not affect the blockchain.
*/
module.exports = KeyStore

/**
  @namespace session.keyStore
*/
function KeyStore(userId) {
  assert.equal('string', typeof userId, 'userId')

  /** @private */
  let state = {}

  /**
    Save a private or public key to the store in either RAM only or RAM and
    disk. Prevents certain key types from being saved on disk.

    @arg {string} path - active/mypermission, owner, owner/active
    @arg {string|array} key - wif, pubkey, or PrivateKey
    @arg {boolean} disk - save to local storage

    @throws {AssertionError} path error or owner/* disk save attempted
  */
  function save(path, key, disk = false) {
    validate.path(path)
    assert(path !== 'master', 'master key should not be saved anywhere')

    const keyType = validate.keyType(key)
    assert(/^wif|pubkey|privateKey$/.test(keyType),
      'key should be a wif, public key string, or privateKey object')
  
    if(disk) {
      assert(path !== 'owner', 'owner key should not be stored on disk')
      assert(path.indexOf('owner/') === 0,
        'owner derived keys should not be stored on disk')
    }

    const wif =
      keyType === 'wif' ? key :
      keyType === 'privateKey' ? ecc.PrivateKey(key).toWif() :
      null

    const pubkey =
      keyType === 'pubkey' ? key :
      keyType === 'privateKey' ? key.toPublic().toString() :
      ecc.privateToPublic(wif)
  
    const userKeyWif = userStorage.key(userId, 'kpath', 'wif', path)
    const userKeyPub = userStorage.key(userId, 'kpath', 'pubkey', path)

    userStorage.save(state, userKeyWif, wif)
    userStorage.save(state, userKeyPub, pubkey)

    if(disk) {
      userStorage.save(localStorage, userKeyWif, wif)
      userStorage.save(localStorage, userKeyPub, pubkey)
    }
  }

  /**
    Remove a key or keys from this key store (ram and disk).

    @arg {path|Array<path>|Set<path>}

    @arg {boolean} keepPublicKey - Enable for better UX; show users keys they
    have access too without requiring them to login. Logging in brings a
    private key online which is not necessary to see public information (balance,
    etc).

    The UX should implement this behavior in a way that is clear public keys
    are cached before enabling this feature.
  */
  function remove(paths, keepPublicKey = false) {
    console.log('keystore ==> remove paths', paths)

    if(typeof paths === 'string') {
      paths = [paths]
    }
    assert(paths instanceof Array || paths instanceof Set, 'paths is a Set or Array')
    paths.forEach(path => {validate.path(paths)})

    for(const path of paths) {
      const userKeyWif = userStorage.key(userId, 'kpath', 'wif', path)
      state[userKeyWif] = null
      localStorage[userKeyWif] = null

      if(!keepPublicKey) {
        const userKeyPub = userStorage.key(userId, 'kpath', 'pubkey', path)
        state[userKeyPub] = null
        localStorage[userKeyPub] = null
      }
    }
  }

  /**
    Return paths for all available keys.  An empty Set is used if there are
    no keys.

    @return {object} {pubkey: Set<pubkey>, wif: Set<wif>}
  */
  function getKeyPaths() {
    const pubkey = new Set()
    const wif = new Set()
    userStorage.query(localStorage, [userId, 'kpath'], ([type, path]) => {
      if(type === 'pubkey') {
        pubkey.add(path)
      } else if(type === 'wif') {
        wif.add(path)
      } else {
        console.log('WARN: unknown key type, ' + type)
      }
    })
    return {pubkey, wif}
  }

  /**
    @example getPublicKey('owner')
    @example getPublicKey('owner/active')
    @example getPublicKey('myaccount/mypermission')

    @return {string} public key or null
  */
  function getPublicKey(path) {
    validate.path(path)
    const userKeyPub = userStorage.key(userId, 'kpath', 'pubkey', path)
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
    const userKeyWif = userStorage.key(userId, 'kpath', 'wif', path)
    return state[userKeyPub] ? state[userKeyPub] : localStorage[userKeyPub]
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
    getKeyPaths,
    wipeSession,
    wipeUser
  }
}

/** Erase all traces of this KeyStore (for all users).  */
KeyStore.wipeAll = function() {
  const prefix = userStorage.key()
  for(const key in localStorage) {
    if(key.indexOf(prefix) === 0) {
      delete localStorage[key]
    }
  }
}
