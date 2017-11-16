const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')
const validate = require('./validate')

module.exports = {
  genKeys,
  keyPaths
}

/** @typedef {{path, PrivateKey}} PrivateKeyPath */

/**
  Derive key path / key pairs for a given parent key and a blockchain account.

  @arg {string|Buffer} parentPrivateKey - Master password, active, owner, or
    other key in the account's permission.

  @arg {accountPermissions} - blockchain account.permissions (see typedef in ./index.js)

  @return {Array<PrivateKeyPath>} - Selected keys or empty array for an invalid login
*/
function keyPaths(accountName, accountPermissions, parentPrivateKey) {
  
}

// @arg {function} selector(path) - Return `false` to skip a key path (public
//   key calculation is expensive).

/**
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

// delete soon:
// /**
//   Login, use this to derive same keyset obtained from generateMasterKeys..
// */
// function getEosKeys(masterPrivateKey) {
//   validate.checkMasterPrivateKey(masterPrivateKey)
//   return genKeys(PrivateKey(masterPrivateKey.substring(2)))
// }