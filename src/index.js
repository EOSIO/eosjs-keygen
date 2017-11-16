const {PrivateKey, key_utils} = require('eosjs-ecc')
const generate = require('./generate')
const Session = require('./session')

module.exports = Session

/**
  New accounts will call this to generate a new keyset..

  A password manager or backup should save the returned
  {masterPrivateKey} for later login.

  @arg {number} cpuEntropyBits - Use 0 for fast testing, 128 (default) takes a second

  @return {object}
  @example
{
  masterPrivateKey, // <= place in a password input field (password manager)
  privateKeys: {owner, active},
  publicKeys: {owner, active}
}
*/
Session.generateMasterKeys = function(cpuEntropyBits) {
  return generate.genKeys(PrivateKey.randomKey(cpuEntropyBits))
}

/**
  @see addEntropy https://github.com/EOSIO/eosjs-ecc/blob/master/src/key_utils.js
*/
Session.addEntropy = (...data) => key_utils.addEntropy(data)

/**
  Public Key (EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV)
  @typedef {string} pubkey
*/

/**
    [Wallet Import Format](https://en.bitcoin.it/wiki/Wallet_import_format)
    (5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp)
    @typedef {string} wif
*/

/**
  Master Private Key.  Strong random key used to derive all other key types.
  (PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp, 'PW' + wif)
  @typedef {string} masterPrivateKey
*/

/**
  Cold storage / recovery key
  @typedef {wif} owner
*/

/**
  Spending key
  @typedef {wif} active
*/

/**
  Master private key or one of its derived private keys.
  @typedef {masterPrivateKey|wif} parentPrivateKey
*/

/**
  Key derviation path (`master`, `owner`, `owner/active`, `myaccount/mypermission`, ..)
  @typedef {string} path
*/

/**
  Permissions object from Eos blockchain obtained via get_account.
  See chain API get_account => account.permissions.

  @typedef {object} accountPermissions

@example const accountPermissions = [{
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
*/

/**
  Glob matching expressions (`myaccount/*`, `myaccount/**`).
  @see https://www.npmjs.com/package/minimatch
  @typedef {string} minimatch
*/

/**
  A valid regular expression string or a regular expression object. If a string
  is provided it is converted to a RegExp by inspecting and optionally adding
  common suffixes and prefixes.

  If a RegExp object is provided, it is used without modification.  

  @typedef {string|RegExp} RegMatch
  @example
// A string RegMatch is handled as follows:

// If it does not sart with ^, root with http or https then any domain
const prefix = re.charAt(0) === '^' ? '' : '^https?://[^/]+/'

// If it does not end with $, allow any valid Url suffix
const suffix = re.charAt(re.length - 1) === '$' ? '' : '([/\?#].*)?$'

return new RegExp(prefix + re + suffix, 'i')
*/

/**
  @typedef {RegMatch|Array<RegMatch>} RegexpSet
*/
