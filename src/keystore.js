/** @module Keystore */

const assert = require('assert')
const {PrivateKey} = require('eosjs-ecc')
const ecc = require('eosjs-ecc')

const Keygen = require('./keygen')
const UriRules = require('./uri-rules')
const validate = require('./validate')
const history = require('./config').history


const {localStorage} = require('./config')
const userStorage = require('./keypath-utils')('kstor')


module.exports = Keystore

/**
  Provides private key management and storage.

  This keystore does not query the blockchain or any external services.
  Removing keys here does not affect the blockchain.

  @arg {string} accountName - Blockchain account name.

  @arg {object} [config]
  @arg {number} [config.timeoutInMin = 30]
  @arg {uriRules} [config.uriRules] - Specify which type of private key will
  be available on certain pages of the application.  Lock it down as much as
  possible and later re-prompt the user if a key is needed.
*/
function Keystore(accountName, config = {}) {
  assert.equal(typeof accountName, 'string', 'accountName')
  assert.equal(typeof config, 'object', 'config')

  const configDefaults = {
    uriRules: {},
    timeoutInMin: 30
  }

  config = Object.assign({}, configDefaults, config)

  const uriRules = UriRules(config.uriRules)

  /** @private */
  const state = {}

  let expireAt, expireInterval
  let unlistenHistory

  // Initialize state from localStorage
  userStorage.query(localStorage, [accountName, 'kpath'], ([path, pubkey], wif) => {
    const storageKey = userStorage.createKey(accountName, 'kpath', path, pubkey)
    state[storageKey] = wif
  })

  /**
    Creates private keys and saves them for use on demand.  This
    may be called to add additional keys which were removed as a result of Uri
    navigation or from calling logout.

    It is possible for the same user to login more than once using a different
    parentPrivateKey (master password or private key).  The purpose is to add
    additional keys to the keystore.

    @arg {parentPrivateKey} parentPrivateKey - Master password (masterPrivateKey),
    active, owner, or other permission key.

    @arg {Array<keyPathMatcher>} [saveLoginsByPath] - These permissions will be
    saved to disk. (example: [`active/**`, ..]). A timeout will not
    expire, logout to remove.

    An exception is thrown if an owner or active key save is attempted.

    @arg {accountPermissions} accountPermissions - Permissions object from Eos
    blockchain via get_account.  This is used to validate the parentPrivateKey
    and derive additional permission keys.  This allows this keystore
    to detect incorrect passwords early before trying to sign a transaction.

    See Chain API `get_account => account.permissions`.

    @throws {Error} 'invalid login'
  */
  function deriveKeys( // deriveKeys (todo rename)
    parentPrivateKey,
    saveLoginsByPath = [],
    accountPermissions
  ) {
    const keyType = validate.keyType(parentPrivateKey)
    if(keyType === 'master') {
      parentPrivateKey = PrivateKey(parentPrivateKey.substring(2))
    } else {
      parentPrivateKey = PrivateKey(parentPrivateKey)
    }

    assert(parentPrivateKey != null,
      'parentPrivateKey is a master password or private key')

    const authsByPath = Keygen.authsByPath(accountPermissions)

    const pathsForAccount = Object.keys(authsByPath)
    const pathsForUrl = uriRules.check(currentUriPath(), pathsForAccount)

    // removeKey(pathsForUrl.deny/*, keepPublicKeys*/)

    // const loginPrivate = Keygen.keysByPath(pathsForUrl.allow, authsByPath)
    // const keys = Keygen.keysByPath(
    //   parentPrivateKey,
    //   accountPermissions,
    //   paths => {
    //     return paths.filter(path => !purges.contains(path))
    //   }
    // )

    // keys.forEach(([path, wif, pubkey]) => {
    //   addKey(path, wif)
    // })

    unlistenHistory = history.listen(() => {
      keepAlive()

      // Prevent certain private keys from being available to high-risk pages.
      const paths = getKeyPaths().wif
      const pathsToPurge = uriRules.check(paths, currentUriPath()).deny
      removeKey(pathsToPurge/*, keepPublicKeys*/)
    })

    if(config.timeoutInMin != null) {
      keepAlive()
      function tick() {
        if(timeUntilExpire() === 0) {
          expire()
        }
      }

      // A small expireIntervalTime may be used for unit testing
      const expireIntervalTime = Math.min(sec, config.timeoutInMin)
      expireInterval = setInterval(tick, expireIntervalTime)
    }
  }

  /**
    Save a private or public key to the store in either RAM only or RAM and
    disk. Prevents certain key types from being saved on disk.

    @arg {keyPath} path - active/mypermission, owner, active, ..
    @arg {string} key - wif, pubkey, or privateKey
    @arg {boolean} disk - save to persistent storage (localStorage)

    @throws {AssertionError} path error or active, owner/* disk save attempted

    @return {{wif, pubkey}}
  */
  function addKey(path, key, disk = false) {
    validate.path(path)

    const keyType = validate.keyType(key)
    assert(/^wif|pubkey|privateKey$/.test(keyType),
      'key should be a wif, public key string, or privateKey object')

    if(disk) {
      assert(path !== 'owner', 'owner key should not be stored on disk')
      assert(path.indexOf('owner/') !== 0,
        'owner derived keys should not be stored on disk')

      // assert(path !== 'active', 'active key should not be stored on disk')
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
    @return {Array<pubkey>} public keys (probably one) or empty array
  */
  function getPublicKeys(path) {
    return getKeys(path).pubkey
  }

  /**
    Return private key for a path.
    @arg {keyPath}
    @return {Array<wif>} wifs (probably one) or empty array
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
  function removeKey(paths, keepPublicKeys = false) {
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

  /**
    Removes any saved keys on disk and clears keys in memory.  Call only when
    the user chooses "logout."  Do not call when the application exits.
  */
  function logout() {
    wipeUser()
    if(unlistenHistory) {
      unlistenHistory()
      unlistenHistory = null
    }
    clearInterval(expireInterval)
  }

  /**
    @return {number} 0 (expired), null, or milliseconds until expire
  */
  function timeUntilExpire() {
    return
      expireAt === 0 ? 0 :
      expireAt == null ? null :
      Math.max(0, expireAt - Date.now())
  }

  /**
    Keep alive (prevent expiration).  Called automatically if Uri navigation
    happens or keys are required.  It may be necessary to call this manually.
  */
  function keepAlive() {
    expireAt = Date.now() + config.timeoutInMin * min
  }

  /** @private */
  function expire() {
    expireAt = 0
    wipeSession()
  }

  /**
    @private
    Erase all keys on disk for this user.
  */
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

  /** @see https://github.com/eosio/eosjs */
  function keyProvider(/*{transaction}*/) {
    return getKeyPaths().wif.map(path =>
      getPrivateKey(path)
    )
  }

  return {
    deriveKeys,
    addKey,
    getKeyPaths,
    getPublicKeys,
    getPrivateKeys,
    getKeys,
    removeKey,
    logout,
    timeUntilExpire,
    keepAlive,
    keyProvider
  }
}

/** @private */
function currentUriPath() {
  const location = history.location
  return `${location.pathname}${location.search}${location.hash}`
}


/** Erase all traces of this keystore (for all users). */
Keystore.wipeAll = function() {
  const prefix = userStorage.createKey()
  for(const key in localStorage) {
    if(key.indexOf(prefix) === 0) {
      delete localStorage[key]
    }
  }
}

// used to convert milliseconds
const sec = 1000, min = 60 * sec
