const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')

module.exports = {
  keyType,
  path,
  checkMasterPrivateKey,
}

const isMasterKey = key =>
  /^PW/.test(key) && key.length > 2 && PrivateKey.isWif(key.substring(2))

function keyType(key) {
  return isMasterKey(key) ? 'master' :
    PrivateKey.isWif(key) ? 'wif' :
    null
}

/**
  Static validation of a path.  Protect against common mistakes.

  @example assert.doesNotThrow(() => path('owner'))
  @example assert.throws(() => path('active'), /Active is a child key of owner/)
  @example assert.doesNotThrow(() => path('owner/active'))
  @example assert.doesNotThrow(() => path('myaccount'))
  @example assert.doesNotThrow(() => path('myaccount/mypermission'))
*/
function path(path) {
  assert.equal(typeof path, 'string', 'path')
  assert(path !== 'active', 'Active is a child key of owner.  Try: owner/active')
  assert(path.indexOf(' ') === -1, 'remove spaces')
  assert(path[0] !== '/', 'path should not start with a slash')
  assert(path[path.length - 1] !== '/', 'path should not end with a slash')
  assert(!/[A-Z]/.test(path), 'path should not have uppercase letters')
}

/**
  @return {boolean} - static validation of the master key
*/
function checkMasterPrivateKey(masterPrivateKey) {
  try {
    checkMasterPrivateKeyOrThrow(masterPrivateKey)
    return true
  } catch(e) {
    return false
  }
}

function checkMasterPrivateKeyOrThrow(masterPrivateKey) {
  assert(typeof masterPrivateKey === 'string', 'invalid master private key')
  assert(/^PW/.test(masterPrivateKey), 'invalid master private key')
  assert(PrivateKey.isWif(masterPrivateKey.substring(2)), 'invalid master private key')
}
