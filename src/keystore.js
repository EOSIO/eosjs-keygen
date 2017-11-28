const assert = require('assert')

const keygen = require('./keygen')
const KeypathStore = require('./keypath-store')
const UriRules = require('./uri-rules')
const validate = require('./validate')
const {PrivateKey} = require('eosjs-ecc')
const history = require('./config').history

module.exports = Keystore

/**
  Provides private key management and storage.

  @arg {string} accountName - Blockchain account name.

  @arg {object} [config]
  @arg {number} [config.timeoutInMin = 30]
  @arg {uriRules} [config.uriRules] - Specify which type of private key will
  be available on certain pages of the application.  Lock it down as much as
  possible and later re-prompt the user if a key is needed.

@example
```js

Keystore = require('eosjs-keygen') // Keystore = require('./src')
Eos = require('eosjs')

Keystore.generateMasterKeys().then(keys => {
  // create blockchain account called 'myaccount'
  console.log(keys)
})

// Todo, move to keystore-factory.js
sessionConfig = {
  timeoutInMin: 30,
  uriRules: {
    'owner' : '/account_recovery',
    'active': '/(transfer|contracts)',
    'active/**': '/producers'
  }
}

// Todo, move to keystore-factory.js
keystore = Keystore('myaccount', sessionConfig)

eos = Eos.Testnet({keyProvider: keystore.keyProvider})

eos.getAccount('myaccount').then(account => {
  // Todo, move to keystore-factory.js
  keystore.deriveKeys('myaccount', account.permissions)
})
```
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
  const keypathStore = KeypathStore(accountName)

  let expireAt, expireInterval
  let unlistenHistory
  
  /**
    Creates private keys and saves them in the keypathStore for use on demand.  This
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

    const authsByPath = keygen.authsByPath(accountPermissions)

    const pathsForAccount = Object.keys(authsByPath)
    const pathsForUrl = uriRules.check(currentUriPath(), pathsForAccount)

    // keypathStore.remove(pathsForUrl.deny/*, keepPublicKeys*/)

    // const loginPrivate = keygen.keysByPath(pathsForUrl.allow, authsByPath)
    // const keys = keygen.keysByPath(
    //   parentPrivateKey,
    //   accountPermissions,
    //   paths => {
    //     return paths.filter(path => !purges.contains(path))
    //   }
    // )

    // keys.forEach(([path, wif, pubkey]) => {
    //   keypathStore.save(path, wif)
    // })

    unlistenHistory = history.listen(() => {
      keepAlive()

      // Prevent certain private keys from being available to high-risk pages.
      const paths = keypathStore.getKeyPaths().wif
      const pathsToPurge = uriRules.check(paths, currentUriPath()).deny
      keypathStore.remove(pathsToPurge/*, keepPublicKeys*/)
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
    Removes any saved keys on disk and clears keys in memory.  Call only when
    the user chooses "logout."  Do not call when the application exits.
  */
  function logout() {
    keypathStore.wipeUser()
    if(unlistenHistory) {
      unlistenHistory()
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
    happens or keys are obtained from the keypathStore.  It may be necessary
    to call this manually.
  */
  function keepAlive() {
    expireAt = Date.now() + config.timeoutInMin * min
  }

  /** @private */
  function expire() {
    expireAt = 0
    keypathStore.wipeSession()
  }

  /** @see https://github.com/eosio/eosjs */
  function keyProvider(/*{transaction}*/) {
    return keypathStore.getKeyPaths().wif.map(path =>
      keypathStore.getPrivateKey(path)
    )
  }

  return {
    deriveKeys, logout,
    timeUntilExpire, keepAlive,
    keyProvider
  }
}

/** @private */
function currentUriPath() {
  const location = history.location
  return `${location.pathname}${location.search}${location.hash}`
}

/**
  New accounts will call this to create a new keyset..

  A password manager or backup should save (at the very minimum) the returned
  {masterPrivateKey} for later login.  The owner and active can be re-created
  from the masterPrivateKey.  It is still a good idea to save all information
  in the backup for easy reference.

  @arg {number} cpuEntropyBits - Use 0 for fast testing, 128 (default) takes a
  second

  @return {Promise}
  @example
{
  masterPrivateKey, // <= place in a password input field (password manager)
  privateKeys: {owner, active}, // <= derived from masterPrivateKey
  publicKeys: {owner, active} // <= derived from masterPrivateKey
}
*/
Keystore.generateMasterKeys = function(cpuEntropyBits) {
  return new Promise(resolve => {
    // By default getKeys creates random masterPrivateKey returns this and
    // other derived keys
    setTimeout(() => {
      const keys = keygen.genKeys(null, cpuEntropyBits)
      resolve(keys)
    })
  })
}

/** Erase all traces of this keystore (for all users). */
Keystore.wipeAll = KeypathStore.wipeAll

// used to convert milliseconds
const sec = 1000, min = 60 * sec
