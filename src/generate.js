const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')
const validate = require('./validate')

module.exports = {
  authsByPath,
  keysByPath,
  genKeys,
}

/** @typedef {Object<keyPath, auth>} keyPathAuth */
/**
  @arg {accountPermissions}
  @return {object<keyPathAuth>}
*/
function authsByPath(accountPermissions) {
  assert(Array.isArray(accountPermissions), 'accountPermissions is an array')
  accountPermissions.forEach(perm => assert.equal(typeof perm, 'object',
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
      } else if(pathStr === 'owner/active') {
        // owner is implied, juse use active
        pathStr = 'active'
      }
      auths[pathStr] = perm.required_auth
    }
  })

  return auths
}

/** @typedef {Object<keyPath, privateKey>} keyPathPrivateKey */

/**
  Derive key path and its corresponding privateKey for a given parent key
  and a blockchain account.

  @arg {parentPrivateKey} parentPrivateKey - Master password, active, owner, or
    other key in the account's permission.

  @arg {object<keyPathAuth>} pathsByAuth - see generate.authsByPath(..)

  @return {Array<keyPathPrivateKey>} - Selected keys or empty array
*/
function keysByPath(parentPrivateKey, pathsByAuth) {
  const keyType = validate.keyType(parentPrivateKey)
  assert(/master|wif|privateKey/.test(keyType),
    'parentPrivateKey is a masterPrivateKey or private key')

  // assert(Array.isArray(accountPermissions), 'accountPermissions is an array')
  // accountPermissions.forEach(perm => assert.equal(typeof perm, 'object', 
  //   'accountPermissions is an array of objects'))

  const result = []
  if(keyType === 'master') {
    const masterPrivateKey = parentPrivateKey
    const loginKeys = genKeys(masterPrivateKey)
    // const roleKeys = keysByRole(acccountPermissions, 'owner')
    // const okeys.publicKeys.owner === 
  }
}

// @arg {function} selector(path) - Return `false` to skip a key path (public
//   key calculation is expensive).

/**
  @arg {masterPrivateKey} [masterPrivateKey = null] When null, a random key
  is created..

  @arg {number} [cpuEntropyBits = null] null to use CPU entropy or 0 for
  fast test keys
*/
function genKeys(masterPrivateKey, cpuEntropyBits) {
  if(masterPrivateKey == null) {
    masterPrivateKey = PrivateKey.randomKey(cpuEntropyBits)
  } else {
    assert(validate.isMasterKey(masterPrivateKey), 'masterPrivateKey')
    masterPrivateKey = PrivateKey(masterPrivateKey.substring('PW'.length))
    assert(masterPrivateKey != null, 'masterPrivateKey is a valid private key')
  }

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
