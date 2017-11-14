const assert = require('assert')
const localStorage = require('localStorage')

const ecc = require('eosjs-ecc')
const validate = require('./validate')

/**
  Rules and storage for private keys.
*/
module.exports = Store

function Store(userId) {
  assert.equal('string', typeof userId, 'userId')

  let state = {}

  /**
    Save a private or public key to the store in either RAM only or RAM and
    disk. Prevents certain key types from being saved on disk.

    @arg {string} path - myaccount/mypermission, owner, owner/active
    @arg {string} key - wif, public key
    @arg {boolean} disk - save to local storage

    @throws {AssertionError} path error or owner/* disk save attempted
  */
  function saveKey(path, key, disk = false) {
    const keyType = validate.keyType(key)
    assert(/^wif|pubkey$/.test(keyType), 'key should be a wif or public key')

    validate.path(path)
    assert(path !== 'master', 'master key should not be saved anywhere')
    if(disk) {
      assert(path !== 'owner', 'owner key should not be stored on disk')
      assert(path.indexOf('owner/') === 0, 'owner derived keys should not be stored on disk')
    }

    const wif = keyType === 'wif' ? key : null
    const pubkey = keyType === 'pubkey' ? key : ecc.privateToPublic(wif)
  
    const userKeyWif = storageKey(userId, 'wif', path)
    const userKeyPub = storageKey(userId, 'pubkey', path)

    save(state, userKeyWif, wif)
    save(state, userKeyPub, pubkey)

    if(disk) {
      save(localStorage, userKeyWif, wif)
      save(localStorage, userKeyPub, pubkey)
    }
  }

  /**
    Remove a key from ram and disk.

    @arg {boolean} keepPublicKey - (true) Can lead to better UX by showing users
      keys they have access too without requiring them to login and bringing a
      private key online.  The UX should make this behavior clear to users
      before turning this on.
  */
  function removeKey(path, keepPublicKey = false) {
    validate.path(path)

    const userKeyWif = storageKey(userId, 'wif', path)
    state[userKeyWif] = null
    localStorage[userKeyWif] = null

    if(!keepPublicKey) {
      const userKeyPub = storageKey(userId, 'pubkey', path)
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
    const userKeyPub = storageKey(userId, 'pubkey', path)
    return coalesce(state[userKeyPub], localStorage[userKeyPub])
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
    const userKeyWif = storageKey(userId, 'wif', path)
    return coalesce(state[userKeyWif], localStorage[userKeyWif])
  }

  /**
    @return {Array<string>} paths for all available public keys (or empty array)
  */
  function getPublicKeyPaths() {
    const paths = new Set()
    queryStorage(localStorage, [userId, 'pubkey'], ([path]) => {
      paths.add(path)
    })
    queryStorage(state, [userId, 'pubkey'], ([path]) => {
      paths.add(path)
    })
    return paths
  }

  /**
    @return {Array<string>} paths for all available private keys (or empty array)
  */
  function getPrivateKeyPaths() {
    const paths = new Set()
    queryStorage(localStorage, [userId, 'wif'], ([path]) => {
      paths.add(path)
    })
    queryStorage(state, [userId, 'wif'], ([path]) => {
      paths.add(path)
    })
    return paths
  }

  /** Erase all keys for this user. */
  function wipeUser() {
    state = {}
    const prefix = storageKey(userId)
    for(const key in localStorage) {
      if(key.indexOf(prefix) === 0) {
        delete localStorage[key]
      }
    }
  }

  return {
    saveKey,
    removeKey,
    getPublicKey,
    getPrivateKey,
    getPublicKeyPaths,
    getPrivateKeyPaths,
    wipeUser
  }
}

/** A storage key encoding format (prefix-friendly for searching).  */
function storageKey(...elements) {
  const key = JSON.stringify(['kstor', ...elements])
  // remove [ and ] so key is prefix-friendly for searching
  const keyTrim = key.substring(1, key.length - 1)
  return Buffer.from(keyTrim).toString('hex')
}

const storageKeyDecode = key =>
  JSON.parse('[' + Buffer.from(key, 'hex') + ']')

function queryStorage(state, keyPrefix, callback) {
  const prefix = storageKey(...keyPrefix)
  for(const key of Object.keys(state)) {
    if(key.indexOf(prefix) !== 0) {
      continue
    }
    const decodedKeys = storageKeyDecode(key)
    callback(decodedKeys.slice(keys.length + 1), key)
  }
}

/**
  Save but do not remove a value from state.

  @throws {AssertionError} immutable
*/
function save(state, key, value, immutable = true) {
  assert.equal('string', typeof key, 'key')
  if(value == null) {
    return
  }

  assert.equal('string', typeof value, 'value')

  const existing = state[key]
  const dirty = existing != value
  assert(existing == null || !dirty || !immutable, 'immutable')

  if(dirty) {
    state[key] = value
  }
}

const coalesce = (...elements) =>
  elements.find(el => el != null)

/** Erase all traces of this KeyStore (for all users).  */
Store.wipeAll = function() {
  const prefix = storageKey()
  for(const key in localStorage) {
    if(key.indexOf(prefix) === 0) {
      delete localStorage[key]
    }
  }
}