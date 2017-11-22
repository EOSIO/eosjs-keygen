const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')
const validate = require('./validate')

module.exports = {
  authsByPath,
  keysByPath,
  genKeys,
}

/**
  @arg {accountPermissions}
  @return {object<path, auth>}
*/
function authsByPath(accountPermissions) {
  assert(Array.isArray(accountPermissions), 'accountPermissions is an array')
  accountPermissions.forEach(perm => assert.equal('object', typeof perm,
    'accountPermissions is an array of objects'))

  const byName = {} // Index by permission name
  accountPermissions.forEach(perm => {
    byName[perm.perm_name] = perm
  })

  function parentPath(perm, stack = []) {
    stack.push(perm.parent)
    const parent = byName[perm.parent]
    if(parent) {
      return parentPath(parent, stack)
    }
    return stack
  }

  const auths = {}
  accountPermissions.forEach(perm => {
    if(perm.parent === '') {
      auths[perm.perm_name] = perm.required_auth
    } else {
      let pathStr = parentPath(perm).reverse().join('/')
      if(pathStr.charAt(0) === '/') {
        pathStr = pathStr.substring(1)
      }
      pathStr = `${pathStr}/${perm.perm_name}`
      if(pathStr.indexOf('owner/active/') === 0) {
        // active is always a child of owner
        pathStr = pathStr.substring('owner/'.length)
      }
      auths[pathStr] = perm.required_auth
    }
  })

  return auths
}

/** @typedef {{path, PrivateKey}} PrivateKeyPath */

/**
  Derive key path / key pairs for a given parent key and a blockchain account.

  @arg {accountPermissions} - blockchain account.permissions (see typedef in ./index.js)
  @arg {parentPrivateKey} parentPrivateKey - Master password, active, owner, or
    other key in the account's permission.

  @return {Array<PrivateKeyPath>} - Selected keys or empty array for an invalid login
*/
function keysByPath(parentPrivateKey, accountPermissions) {
  const keyType = validate.keyType(parentPrivateKey)
  assert(/master|wif|privateKey/.test(keyType),
    'parentPrivateKey is a masterPrivateKey or private key')

  assert(Array.isArray(accountPermissions), 'accountPermissions is an array')
  accountPermissions.forEach(perm => assert.equal('object', typeof perm,
    'accountPermissions is an array of objects'))

  const result = []
  if(keyType === 'master') {
    const masterPrivateKey = parentPrivateKey.substring(2)
    const loginKeys = genKeys(masterPrivateKey)
    // const roleKeys = keysByRole(acccountPermissions, 'owner')
    // const okeys.publicKeys.owner === 
  }
}

// @arg {function} selector(path) - Return `false` to skip a key path (public
//   key calculation is expensive).

/**
  @arg {wif} [masterPrivateKey = null] When null, a random key is created..
  @arg {number} [cpuEntropyBits = null] null to use CPU entropy or 0 for
  fast test keys
*/
function genKeys(masterPrivateKey, cpuEntropyBits) {
  if(masterPrivateKey == null) {
    masterPrivateKey = PrivateKey.randomKey(cpuEntropyBits)
  }
  masterPrivateKey = PrivateKey(masterPrivateKey)
  assert(masterPrivateKey != null,
    'masterPrivateKey is a valid private key')

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

// delete soon:
// /**
//   Login, use this to derive same keyset obtained from generateMasterKeys..
// */
// function getEosKeys(masterPrivateKey) {
//   validate.checkMasterPrivateKey(masterPrivateKey)
//   return genKeys(PrivateKey(masterPrivateKey.substring(2)))
// }