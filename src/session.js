const assert = require('assert')

const generate = require('./generate')
const KeyStore = require('./keystore')
const UrlRules = require('./url-rules')
const validate = require('./validate')
const {PrivateKey} = require('eosjs-ecc')
const history = require('./config').history

module.exports = Session

/**
  Provides private key management and storage.

  @arg {string} userId - An stable identifier (or hash) for the user. Make
  sure the id is stored externally before it is used here.  The Id may
  be created before a blockchain account name is available.  An account
  name may be assigned later in the login function.

  @arg {object} [config]
  @arg {number} [config.timeout = 30] - minutes
  @arg {Object<minimatch, UrlPathSet>} [config.urlRules] - Specify which type
  of private key will be available on certain pages of the application.

@example
```js
Session = require('eosjs-keygen')

config = {
  timeout: 30,
  urlRules: {
    'owner': 'account_recovery',
    'owner/active': '@${accountName}/transfers',
    'active/**': '@${accountName}'
  }
}

session = Session('unique_userId', config)

session.login(...)
```
*/
function Session(userId, config = {}) {
  assert.equal('string', typeof userId, 'userId')
  assert.equal('object', typeof config, 'config')

  const configDefaults = {
    urlRules: {},
    timeout: 30
  }

  config = Object.assign({}, configDefaults, config)

  const urlRules = UrlRules(config.urlRules)
  const keyStore = KeyStore(userId)
  
  let expireAt, expireInterval
  let unlistenHistory
  
  /**
    Creates private keys and saves them in the keystore for use on demand.  This
    may be called to add additional keys which were removed as a result of Url
    navigation or from calling logout.

    @arg {parentPrivateKey} parentPrivateKey - Master password (masterPrivateKey),
    active, owner, or other permission key.

    @arg {accountPermissions} accountPermissions - Permissions object from Eos
    blockchain via get_account.  This is used to validate the parentPrivateKey
    and derive additional permission keys.  This allows this session
    to detect incorrect passwords early before trying to sign a transaction.
    See Chain API `get_account => account.permissions`.
   
    @arg {Array<minimatch>} [saveLoginsByPath] - These permissions will be
    saved to disk.  An exception is thrown if a master, owner or active key
    save is attempted. (example: ['**', ..]). A timeout will not
    expire, logout to remove.

    @throws {Error} 'invalid login'
  */
  function login(
    parentPrivateKey,
    accountPermissions,
    saveLoginsByPath = []
  ) {
    const keyType = validate.keyType(parentPrivateKey)
    if(keyType === 'master') {
      parentPrivateKey = PrivateKey(parentPrivateKey.substring(2))
    } else {
      parentPrivateKey = PrivateKey(parentPrivateKey)
    }
    assert(parentPrivateKey != null,
      'parentPrivateKey is a master password or private key')

    const authsByPath = generate.authsByPath(accountPermissions)
    const paths = Object.keys(authsByPath)
    const allowedPaths = urlRules.check(paths, currentUrl())

    for(const path of allowedPaths) {
      
    }
    // const keys = generate.keysByPath(
    //   parentPrivateKey,
    //   accountPermissions,
    //   paths => {
    //     return paths.filter(path => !purges.contains(path))
    //   }
    // )

    // keys.forEach(([path, wif, pubkey]) => {
    //   keyStore.save(path, wif)
    // })

    unlistenHistory = history.listen(() => {
      keepAlive()

      // Prevent certain private keys from being available to high-risk pages.
      const paths = keyStore.getKeyPaths().wif
      const pathsToPurge = urlRules.check(paths, currentUrl())
      keyStore.remove(pathsToPurge/*, keepPublicKey*/)
    })

    if(config.timeout != null) {
      keepAlive()
      function tick() {
        if(timeUntilExpire() === 0) {
          expire()
        }
      }

      // A small expireIntervalTime may be used for unit testing
      const expireIntervalTime = Math.min(sec, config.timeout)
      expireInterval = setInterval(tick, expireIntervalTime)
    }
  }

  /**
    Removes any saved keys on disk and clears keys in memory.  Call only when
    the user chooses "logout."  Do not call when the application exits.
  */
  function logout() {
    keyStore.wipeUser()
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
    Keep alive (prevent expiration).  Called automatically if Url navigation
    happens or keys are obtained from the keyStore.  It may be necessary
    to call this manually.
  */
  function keepAlive() {
    expireAt = Date.now() + config.timeout * min
  }

  /** @private */
  function expire() {
    expireAt = 0
    keyStore.wipeSession()
  }

  return {
    login, logout,
    timeUntilExpire, keepAlive
  }
}

/** @private */
function currentUrl() {
  const location = history.location
  const url = `${location.pathname}${location.search}${location.hash}`
  return url
}

/**
  New accounts will call this to generate a new keyset..

  A password manager or backup should save the returned
  {masterPrivateKey} for later login.

  @arg {number} cpuEntropyBits - Use 0 for fast testing, 128 (default) takes a
  second

  @return {Promise}
  @example
{
  masterPrivateKey, // <= place in a password input field (password manager)
  privateKeys: {owner, active},
  publicKeys: {owner, active}
}
*/
Session.generateMasterKeys = function(cpuEntropyBits) {
  return new Promise(resolve => {
    const keys = generate.genKeys(PrivateKey.randomKey(cpuEntropyBits))
    resolve(keys)
  })
}

/** Erase all traces of this session (for all users). */
Session.wipeAll = KeyStore.wipeAll

const sec = 1000, min = 0 * sec
