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
  assert.equal('string', typeof keys.masterPrivateKey, 'keys.masterPrivateKey')

  assert.equal('object', typeof keys.privateKeys, 'keys.privateKeys')
  assert.equal('string', typeof keys.privateKeys.owner, 'keys.privateKeys.owner')
  assert.equal('string', typeof keys.privateKeys.active, 'keys.privateKeys.active')

  assert.equal('object', typeof keys.publicKeys, 'keys.publicKeys')
  assert.equal('string', typeof keys.publicKeys.owner, 'keys.publicKeys.owner')
  assert.equal('string', typeof keys.publicKeys.active, 'keys.publicKeys.active')
}

module.exports = {
  accountPermissions,
  checkKeySet
}