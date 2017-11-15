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

  @arg {object} accountPermissions - Permissions object from Eos blockchain
    obtained via get_account. See chain API get_account =>
    account.account_permissions.

  @arg {function} selector(path) - Return `false` to skip a key path (public
    key calculation is expensive).

  @example accountPermissions: [{
    name: 'active',
    parent: 'owner',
    required_auth: {
      threshold: 1,
      keys: [{
          key: 'EOS78Cs5HPKY7HKHrSMnR76uj7yeajPuNwSH1Fsria3sJuufwE3Zd',
          weight: 1
        }
      ],
      accounts: []
    }
  },{
    name: 'owner',
    parent: '',
    required_auth: {
      threshold: 1,
      keys: [{
          key: 'EOS78Cs5HPKY7HKHrSMnR76uj7yeajPuNwSH1Fsria3sJuufwE3Zd',
          weight: 1
        }
      ],
      accounts: []
    }
  }]

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