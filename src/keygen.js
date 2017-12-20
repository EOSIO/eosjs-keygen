/** @module Keygen */

const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')
const validate = require('./validate')

module.exports = {
  generateMasterKeys,
  authsByPath,
  deriveKeys
}

/**
  New accounts will call this to create a new keyset..

  A password manager or backup should save (at the very minimum) the returned
  {masterPrivateKey} for later login.  The owner and active can be re-created
  from the masterPrivateKey.  It is still a good idea to save all information
  in the backup for easy reference.

  @arg {masterPrivateKey} [masterPrivateKey = null] When null, a new random key
  is created.

  @return {Promise<object>} masterKeys

  @example
masterKeys = {
  masterPrivateKey, // <= place in a password input field (password manager)
  privateKeys: {owner, active}, // <= derived from masterPrivateKey
  publicKeys: {owner, active} // <= derived from masterPrivateKey
}
*/
function generateMasterKeys(masterPrivateKey = null) {
  let master
  if(masterPrivateKey == null) {
    master = PrivateKey.randomKey()
  } else {
    assert(validate.isMasterKey(masterPrivateKey), 'masterPrivateKey')
    master = PrivateKey(masterPrivateKey.substring('PW'.length))
  }

  return Promise.resolve(master).then(master => {
    const ownerPrivate = master.getChildKey('owner')
    const activePrivate = ownerPrivate.getChildKey('active')

    return {
      masterPrivateKey: `PW${master.toWif()}`,
      privateKeys: {
        owner: ownerPrivate.toWif(),
        active: activePrivate.toWif()
      },
      publicKeys: {
        owner: ownerPrivate.toPublic().toString(),
        active: activePrivate.toPublic().toString()
      }
    }
  })
}

/** @typedef {Object<keyPath, auth>} keyPathAuth */

/**
  @private

  Recursively create keyPath using the parent links in the blockchain
  account's permission object.  Under this keyPath, store the full
  required_auth structure for later inspection.

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

/**
  @private see keystore.deriveKeys

  Derive missing intermediate keys and paths for the given path.

  @return {Array} [{path, privateKey}] newly derived keys or empty array (keys already
  exist or can't be derived).
*/
function deriveKeys(path, wifsByPath) {
  validate.path(path)
  assert.equal(typeof wifsByPath, 'object', 'wifsByPath')

  if(wifsByPath[path]) {
    return []
  }

  let maxLen = 0
  let bestPath = 0

  const paths = Object.keys(wifsByPath)
  for(const wifPath in wifsByPath) {
    if(path.indexOf(`${wifPath}/`) === 0) {
      if(wifPath.length > maxLen){
        maxLen = wifPath.length
        bestPath = wifPath
      }
    }
  }

  if(!bestPath) {
    return []
  }

  const newKeys = []
  let extendedPath = bestPath
  const wif = wifsByPath[bestPath]
  assert(!!wif, 'wif')
  let extendedPrivate = PrivateKey(wif)
  for(const extend of path.substring(bestPath.length + '/'.length).split('/')) {
    extendedPrivate = extendedPrivate.getChildKey(extend)
    extendedPath += `/${extend}`
    newKeys.push({
      path: extendedPath,
      privateKey: extendedPrivate
    })
  }

  return newKeys
}



