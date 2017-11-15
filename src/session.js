const assert = require('assert')

const generate = require('./generate')
const KeyStore = require('./keystore')
const UrlRules = require('./url-rules')
const validate = require('./validate')

module.exports = Session

/**
  Provides private key management and storage.

  @arg {string} userId - An identifier for the user (stable hash for a user).
    Make sure the id is stored externally before it is used here.

  @arg {object} [config]
  @arg {number} [config.timeout = 30] - minutes
  @arg {Object<minimatch, RegexpSet>} [config.urlRules] - Specify which type
  of private key will be available on certain pages of the application.

@example
```js
Session = require('eosjs-keygen')

config = {
  timeout: 30,
  urlRules: {
    'owner': 'account_recovery',
    'owner/active': '@${accountName}/transfers',
    '${accountName}/**': '@${accountName}'
  }
}

session = Session('userid', config)

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
  let lastUrl

  /**
    @private
    Prevent certain private keys from being available to high-risk pages.

    Call this function:
    - Before logging in
    - On each Url change before the page loads

    The Url is tested against config.urlRules and matches may prevent that
    private key from sticking around.

    @arg {string} url
    @example url = 'http://localhost/@myaccount/transfers'
  */
  function currentUrl(url) {
    lastUrl = url
    const paths = keyStore.getKeyPaths()
    const checks = urlRules.check(paths.wif, url)
    checks.forEach(path => { keyStore.remove(path) })
  }

  /**
    Creates private keys and saves them in the keystore for use on demand.  This
    may be called to add additional keys which were removed as a result of Url
    navigation or from calling logout.

    @arg {string} accountName - Blockchain account.name (example: myaccount)

    @arg {parentPrivateKey} parentPrivateKey - Master password (masterPrivateKey),
      active, owner, or other permission key.

    @arg {accountPermissions} accountPermissions - Permissions object from Eos
      blockchain via get_account.  This is used to validate the parentPrivateKey
      and derive additional permission keys.  This allows this session
      to detect incorrect passwords early before trying to sign a transaction.
      See Chain API `get_account => account.permissions`.

    @arg {Array<minimatch>} [saveLoginsByPath] - These permissions will be
      saved to disk.  An exception is thrown if a master, owner or active key
      save is attempted. (example: ['myaccount/**', ..])
  */
  function login(accountName, parentPrivateKey, accountPermissions, saveLoginsByPath = []) {
    assert(lastUrl != null, 'call currentUrl first')
    

    // TODO design here is still work-in-progress

    // const paths = generate.accountPermissionPaths(accountPermissions)
    // const purges = urlRules.check(paths, lastUrl)
    
    const keys = generate.keyPaths(
      parentPrivateKey,
      accountPermissions,
      paths => {
        return paths.filter(path => !purges.contains(path))
      }
    )
    keys.forEach(([path, wif, pubkey]) => {
      keyStore.save(path, wif)
    })
  }

  /**
    Removes any saved keys on disk and clears keys in memory.  Call only when
    the user chooses "logout."  Do not call when the application exits.
  */
  function logout() {
    keyStore.wipeUser()
  }

  /**
    @return {number} 0 (expired) or milliseconds until expire
  */
  function timeUntilExpire() {
    return 0
  }

  /** Keep alive (prevent expiration). */
  function keepAlive() {
    
  }

  return {
    logout, currentUrl, login,
    timeUntilExpire, keepAlive
  }
}
