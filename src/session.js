const assert = require('assert')

const generate = require('./generate')
const KeyStore = require('./keystore')
const validate = require('./validate')

module.exports = Session

function Session(userId, timeout = 30 * min) {
  assert.equal('string', typeof userId, 'userId')

  const keyStore = KeyStore(userId)

  /**
    @return {number} 0 (expired) or milliseconds until expire
  */
  function timeUntilExpire() {
    return 0
  }

  /** Keep alive (prevent expiration).  Optimized for multiple calls. */
  function keepAlive() {

  }

  /**
    Save or over-write localStorage url rules.

    @arg {path} path - regular expression (must make a full-match)
    @arg {string|Array<string>} regularExpressions - will run as case-insensitive 

    @example manage.urlRule('owner', '^https?://[^/]+/account_recovery(/.*)?$')
    @example manage.urlRule('owner/active', '^https?://[^/]+/wallet(/.*)?$')
    @example manage.urlRule('myaccount/.+', '^https?://[^/]+/@[a-z0-5\.](/.*)?$')
  */
  function urlRule(path, regularExpressions) {
    if(typeof regularExpressions === 'string') {
      regularExpressions = [regularExpressions]
    }
    validate.path(path)
    assert.equals('string', typeof regularExpression, 'regularExpression')
    // localStorage...
  }

  /** @arg {string} url */
  function checkUrl(url) {

  }

  return {
    timeUntilExpire, keepAlive,
    urlRule, checkUrl
  }
}

const sec = 1000, min = 60 * sec//, hour = 60 * min

// 
// Add to the available private keys in this session.  Keys created here
// are not saved.
// 
// @see persistKey(path) to save a keys