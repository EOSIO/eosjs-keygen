const assert = require('assert')

const {PrivateKey} = require('eosjs-ecc')
const validate = require('./validate')

module.exports = {
  generateMasterKeys,
  getEosKeys
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
  validate.checkMasterPrivateKey(masterPrivateKey)
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
