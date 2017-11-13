const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')

module.exports = {
  generateMasterKeys,
  getEosKeys,
  validPath,
  keyType,
}

/**
  New accounts will call this to generate a new keyset..

  A password manager or backup should save the returned
  {masterPrivateKey} for later login via getEosKeys.

  @arg {number} cpuEntropyBits - Use 0 for fast testing, 128 (default) takes a second

  @return {object} {
    masterPrivateKey, // <- browser "save password" (aka password manager)
    privateKeys: {owner, active},
    publicKeys: {owner, active}
  }
*/
function generateMasterKeys(cpuEntropyBits) {
  return genKeys(PrivateKey.randomKey(cpuEntropyBits))
}

/**
  Login, use this to derive same keyset obtained from generateMasterKeys..
*/
function getEosKeys(masterPrivateKey) {
  checkMasterPrivateKey(masterPrivateKey)
  return genKeys(PrivateKey(masterPrivateKey.substring(2)))
}

/**
  @private
*/
function genKeys(masterPrivateKey) {
  const ownerPrivate = masterPrivateKey.getChildKey('owner')
  const activePrivate = ownerPrivate.getChildKey('active')
  return {
    masterPrivateKey: `PW${masterPrivateKey.toWif()}`,
    privateKeys: {
      owner: ownerPrivate.toWif(),
      active: activePrivate.toWif()
    },
    publicKeys: {
      owner: ownerPrivate.toPublic().toString(),
      active: activePrivate.toPublic().toString()
    }
  }
}

/**
  Static validation of a path.  Protect against common mistakes.

  @example assert.doesNotThrow(() => validPath('owner'))
  @example assert.throws(() => validPath('active'), /Active is a child key of owner/)
  @example assert.doesNotThrow(() => validPath('owner/active'))
  @example assert.doesNotThrow(() => validPath('myaccount'))
  @example assert.doesNotThrow(() => validPath('myaccount/mypermission'))
*/
function validPath(path) {
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

function keyType(key) {
  return isMasterKey(key) ? 'master' :
    PrivateKey.isWif(key) ? 'wif' :
    null
}

const isMasterKey = key =>
  /^PW/.test(key) && key.length > 2 && PrivateKey.isWif(key.substring(2))
