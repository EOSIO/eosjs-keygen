const assert = require('assert')

const accountPermissions = [{
  perm_name: 'active',
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
  perm_name: 'mypermission',
  parent: 'active',
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
  perm_name: 'owner',
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

function checkKeySet(keys) {
  assert.equal(typeof keys.masterPrivateKey, 'string', 'keys.masterPrivateKey')

  assert.equal(typeof keys.privateKeys, 'object', 'keys.privateKeys')
  assert.equal(typeof keys.privateKeys.owner, 'string', 'keys.privateKeys.owner')
  assert.equal(typeof keys.privateKeys.active, 'string', 'keys.privateKeys.active')

  assert.equal(typeof keys.publicKeys, 'object', 'keys.publicKeys')
  assert.equal(typeof keys.publicKeys.owner, 'string', 'keys.publicKeys.owner')
  assert.equal(typeof keys.publicKeys.active, 'string', 'keys.publicKeys.active')
}

module.exports = {
  accountPermissions,
  checkKeySet
}