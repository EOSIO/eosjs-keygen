const assert = require('assert')

const {PrivateKey, PublicKey} = require('eosjs-ecc')

module.exports = {
  keyType,
  path,
  checkMasterPrivateKey,
}

const isMasterKey = key =>
  /^PW/.test(key) && PrivateKey.isWif(key.substring(2))

function keyType(key) {
  return isMasterKey(key) ? 'master' :
    PrivateKey.isWif(key) ? 'wif' :
    PrivateKey.isPrivateKey(key) ? 'privateKey' :
    PublicKey.fromString(key) != null ? 'pubkey' :
    null
}

/**
  Static validation of a path.  Protect against common mistakes.

  @example path('master')
  @example path('owner')
  @example path('owner/active')
  @example path('myaccount/mypermission')

  @see validate.test.js Validate, path
*/
function path(path) {
  assert.equal(typeof path, 'string', 'path')
  assert(path !== '', 'path should not be empty')
  assert(path.indexOf(' ') === -1, 'remove spaces')
  assert(path.indexOf('\\') === -1, 'use forward slash')
  assert(path[0] !== '/', 'remove leading slash')
  assert(path[path.length - 1] !== '/', 'remove ending slash')
  assert(!/[A-Z]/.test(path), 'path should not have uppercase letters')

  const el = Array.from(path.split('/'))
  assert(!el.includes('master') || path === 'master',
    'master is an implied root to the owner key, omit master from your path')

  assert(!el.includes('active') || path === 'owner/active',
    'active is implied or a child of owner, ex: myaccount/mypermission or owner/active')

  assert(!el.includes('owner') || el.indexOf('owner') === 0,
    'owner is always the root')
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
