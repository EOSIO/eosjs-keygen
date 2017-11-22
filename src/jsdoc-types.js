
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
    Private key object from eosjs-ecc.

    @typedef {object} PrivateKey
*/

/**
  Master Private Key.  Strong random key used to derive all other key types.
  Has a 'PW' prefix followed by a valid wif. (`'PW' + wif ===
  'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'`)
  @typedef {string} masterPrivateKey
*/

/**
  Cold storage / recovery key.  Has authoritiy to do everything including
  account recovery.
  @typedef {wif} owner
*/

/**
  Spending key.  Has the authority to do everything except account recovery.
  @typedef {wif} active
*/

/**
  Master private key or one of its derived private keys.
  @typedef {masterPrivateKey|wif} parentPrivateKey
*/

/**
  Key derviation path (`master`, `owner`, `owner/active`, `active/mypermission`, ..)
  @typedef {string} path
*/

/**
  A URL without the prefixing protocol, host, and /
  @typedef {string} urlpath
  @example 
*/

/**
  Signing Keys and(or) Accounts each having a weight that when matched in
  the signatures should accumulate to meet or exceed the auth's total threshold.

  @typedef {object} auth
  @example
required_auth: {
  threshold: 1,
  keys: [{
      key: 'EOS78Cs5HPKY7HKHrSMnR76uj7yeajPuNwSH1Fsria3sJuufwE3Zd',
      weight: 1
    }
  ],
  accounts: []
}

/**
  Permissions object from Eos blockchain obtained via get_account.
  See chain API get_account => account.permissions.

  @typedef {object} accountPermissions

@example const accountPermissions = [{
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
*/

/**
  Glob matching expressions (`active/**`, `owner/*`).
  @see https://www.npmjs.com/package/minimatch
  @typedef {string} minimatch
*/

/**
  A valid regular expression string or a regular expression object. If a string
  is provided it is converted to a RegExp by inspecting and optionally adding
  common suffixes and prefixes.

  If a RegExp object is provided, it is used without modification.  

  @typedef {string|RegExp} UrlPathMatch
  @example
// A string is handled as follows..

// If it does not sart with ^, ensure match starts with /
const prefix = re.charAt(0) === '^' ? '' : '^/'

// If it does not end with $, allow any valid Url suffix after your path
const suffix = re.charAt(re.length - 1) === '$' ? '' : '([/\?#].*)?$'

// Path matches are case in-sensitive (per the url specification)
return new RegExp(prefix + re + suffix, 'i')
*/

/**
  @typedef {UrlPathMatch|Array<UrlPathMatch>} UrlPathSet
*/
