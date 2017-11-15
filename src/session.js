const assert = require('assert')

const generate = require('./generate')
const KeyStore = require('./keystore')
const UrlRules = require('./url-rules')
const validate = require('./validate')

/**
  Provides key management such as local storage and session with additional
  security features such as access levels and timeout.
*/
module.exports = Session

/**
  @arg {object} config
  @arg {Array} config.urlRules - white-list keys (by role) to certain pages

  @example config.urlRules = {
    'owner': 'account_recovery',
    'owner/active': '@[\w\.]+/transfers',
    'myaccount/[\w\.]+': '@[\w\.]'
  }
*/
function Session(userId, config = {}) {
  assert.equal('string', typeof userId, 'userId')
  assert.equal('object', typeof config, 'config')

  const configDefaults = {
    timeout: 30 * min,
    urlRules: {}
  }

  config = Object.assign({}, configDefaults, config)

  const urlRules = UrlRules(config.urlRules)
  const keyStore = KeyStore(userId)
  let lastUrl

  /**
    Removes any saved logings and clears any keys RAM.  Call only when the user
    chooses "logout."  Do not call when the application exits.
  */
  function logout() {
    keyStore.wipeUser()
  }

  /**
    This should be called on each Url change and before logging in.  The Url is
    tested with urlRules and may prevent the creation of remove extra private
    keys that should not exist on the current page.

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
  */
  function login(parentPrivateKey, accountPermissions) {
    assert(lastUrl != null, 'call currentUrl first')
    const keys = generate.keyPaths(
      parentPrivateKey,
      accountPermissions,
      paths => {
        const purges = urlRules.check(paths, lastUrl)
        return paths.filter(path => !purges.contains(path))
      }
    )
    keys.forEach(([path, wif, pubkey]) => {
      keyStore.save(path, wif)
    })
  }

  /**
    @return {number} 0 (expired) or milliseconds until expire
  */
  function timeUntilExpire() {
    return 0
  }

  /** Keep alive (prevent expiration).  Optimized for multiple calls. */
  function keepAlive() {
    
  }

  return {
    timeUntilExpire, keepAlive, checkUrl
  }
}

const sec = 1000, min = 60 * sec//, hour = 60 * min
