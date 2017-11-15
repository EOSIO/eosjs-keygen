const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')
const validate = require('./validate')

module.exports = {
  generateMasterKeys,
  keyPaths
}

/**
  New accounts will call this to generate a new keyset..

  A password manager or backup should save the returned
  {masterPrivateKey} for later login via getEosKeys.

  @arg {number} cpuEntropyBits - Use 0 for fast testing, 128 (default) takes a second

  @return {object} {
    masterPrivateKey, // <= place in a password input field (password manager)
    privateKeys: {owner, active},
    publicKeys: {owner, active}
  }
*/
function generateMasterKeys(cpuEntropyBits) {
  return genKeys(PrivateKey.randomKey(cpuEntropyBits))
}

/**
  Derive key path / key pairs for a given parent key and a blockchain account.

  @arg {string|Buffer} parentPrivateKey - Master password, active, owner, or
    other key in the account's permission.

  @arg {accountPermissions} - blockchain account.permissions (see typedef in ./index.js)

  @arg {function} selector(path) - Return `false` to skip a key path (public
    key calculation is expensive).

  @return {Array<object>} - [{path, wif, pubkey}] or empty array for an invalid login
*/
function keyPaths(parentPrivateKey, accountPermissions, selector = () => true) {
  
}

/** @private */
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