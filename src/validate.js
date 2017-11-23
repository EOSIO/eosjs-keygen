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
    PrivateKey.isValid(key) ? 'privateKey' :
    PublicKey.isValid(key) ? 'pubkey' :
    null
}

/**
  Static validation of a path.  Protect against common mistakes.

  @example path('owner')
  @example path('active')
  @example path('active/mypermission')

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

  assert(path !== 'owner/active', 'owner is implied, juse use active')

  const el = Array.from(path.split('/'))

  const unique = new Set()
  el.forEach(e => {unique.add(e)})
  assert(unique.size === el.length, 'duplicate path element')

  assert(el[0] === 'owner' || el[0] === 'active',
    'path should start with owner/ or active/')

  assert(!el.includes('owner') || el.indexOf('owner') === 0,
    'owner is always the root')

  assert(!el.includes('active') || el.indexOf('active') === 0 ||
    el.indexOf('active') === 1, 'active is always first or second')
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
