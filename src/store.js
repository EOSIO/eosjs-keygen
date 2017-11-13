const assert = require('assert')
const localStorage = require('localStorage')

const validate = require('./validate')

/** Local storage prefix */
const LS_PREFIX = Buffer.from('keystore').toString('hex') + '-'

/**
  This will hold keys in RAM or local storage.
*/
module.exports = Store

function Store(userId) {
  assert.equal('string', typeof userId, 'userId')

  const UID_PREFIX = LS_PREFIX + '-' + userId + '-'
  let state = {}

  /**
    @arg {string} key - wif, public key, mater key
    @arg {string} [path] - One of: master (may be omitted),
      myaccount/mypermission, owner, owner/active

    @throws {AssertionError} 'invalid path for key'
  */
  function saveRam(key, path) {
    validate.path(path)

    // ...
  }

  /**
    Save any special permission key to disk.  Prevents private owner,
    active, or master key from being saved.

    @arg {string} key - wif or public key
    @arg {string} path - 'myaccount/mypermission'

    @throws {AssertionError} 'xxx key should not be stored on disk'
  */
  function saveDisk(key, path) {
    validate.path(path)
    assert(path !== 'owner', 'owner key should not be stored on disk')
    assert(path !== 'owner/active', 'active key should not be stored on disk')

    // ...
  }

  /**
    Remove a key from ram or disk.
    @arg {boolean} keepPublicKey - (true) Can lead to better UX by showing users
      keys they have access too without requiring them to login or create a
      private key.  This is false by default to avoid surprises.
  */
  function remove(path, keepPublicKey = false) {
    validate.path(path)
  
    // ..
  }

  /**
    @example getPublicKey('owner')
    @example getPublicKey('owner/active')
    @example getPublicKey('myaccount/mypermission')

    @return {string} public key or null
  */
  function getPublicKey(path) {
  }

  /**
    Return or derive a private key.  

    @example getPrivateKey('owner')
    @example getPrivateKey('owner/active')
    @example getPrivateKey('myaccount/mypermission')

    @return {string} wif or null
  */
  function getPrivateKey(path) {
  }

  /**
    @return {Array<string>} paths for all available public keys (or empty array)
  */
  function getPublicKeyPaths() {
  }

  /**
    @return {Array<string>} paths for all available private keys (or empty array)
  */
  function getPrivateKeyPaths() {
  }

  /** Erase all keys for this user. */
  function wipeUser() {
    state = {}
    for(const key in localStorage) {
      if(key.indexOf(UID_PREFIX) === 0) {
        delete localStorage[key]
      }
    }
  }

  return {
    saveRam,
    saveDisk,
    remove,
    getPublicKey,
    getPrivateKey,
    getPublicKeyPaths,
    getPrivateKeyPaths,
    wipeUser
  }
}

/** Erase all traces of this KeyStore (for all users).  */
Store.wipeAll = function() {
  for(const key in localStorage) {
    if(key.indexOf(LS_PREFIX) === 0) {
      delete localStorage[key]
    }
  }
}