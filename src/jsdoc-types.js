
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

  @typedef {object} privateKey
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
  Signing Keys and(or) Accounts each having a weight that when matched in
  the signatures should accumulate to meet or exceed the auth's total threshold.

  @typedef {object} auth

  @example required_auth: {
  threshold: 1,
  keys: [{
      key: 'EOS78Cs5HPKY7HKHrSMnR76uj7yeajPuNwSH1Fsria3sJuufwE3Zd',
      weight: 1
    }
  ],
  accounts: []
}
*/

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
  @see [validate.path(keyPath)](./validate.js)
  
  @typedef {string} keyPath
  @example 'owner', 'active', 'active/mypermission'
*/

/**
  An expanded version of a private key, a keypath ('active/mypermission'),
  and its calculated public key (for performance reasons).

  @typedef {object} keyPathPrivate
  @property {wif} wif 
  @property {pubkey} pubkey
  @property {keyPath} path
*/

/**
  Glob matching expressions (`active`, `active/**`, `owner/*`).
  @see https://www.npmjs.com/package/minimatch
  @typedef {string} minimatch
*/

/**
  Key derviation path (`owner`, `active/*`, `active/**`, `active/mypermission`)
  @typedef {minimatch} keyPathMatcher
*/

/**
  A URI without the prefixing scheme, host, port.

  @typedef {string} uriData
  @example '/producers', '/account_recovery#name=..'
*/

/**
  A valid regular expression string.  The provided string it modified when
  it is converted to a RegExp object:

  - A start of match is implied (`^` is always added, do not add one)
  - Unless the uriPath ends with `$`, automatically matches query parameters
    and fragment (hash tag info).
  - The RegExp that is created is always case-insensitive to help a
    non-canonical path match.  Uri paths should be canonical though.

  @typedef {string} uriMatcher

  @example '/(transfer|contracts)', '/bare-uri$'
  @example function createPathMatcher(path) {
  // Ensure match starts at the begining
  const prefix = '^'

  // If path matcher does not end with $, allow Uri query and fragment
  const suffix = path.charAt(path.length - 1) === '$' ? '' : '\/?([\?#].*)?$'

  // Path matches are case in-sensitive
  return new RegExp(prefix + path + suffix, 'i')
}
*/

/**
  @typedef {uriMatcher|Array<uriMatcher>} uriMatchers
*/

/**
  @typedef {Object<keyPathMatcher, uriMatchers>} uriRule
  @example {
  'owner': '/account_recovery$', // <= $ prevents query or fragment params
  'active': ['/transfer', '/contracts']
}
*/

/**
  @typedef {Object<uriRule>} uriRules

  Define rules that says which private keys may exist within given locations
  of the application.  If a rule is not found or does not match, the keystore
  will remove the key.  The UI can prompt the user to obtain the needed key
  again.

  For any non-trivial configuration, implementions should create a unit test
  that will test the actual configuration used in the application
  (use ./uri-rules.test.js as a template).

  Paths imply that active is always derived from owner.  So, instead of writing
  `owner/active/**` the path must be written as `active/**`.

  @example uriRules = { // Hypothetical examples
  // Allow owner and all derived keys (including active)
  'owner': '/account_recovery',

  // Allow active key (and any derived child)
  'active': '/(transfer|contracts)',

  // Allow keys derived from active (but not active itself)
  'active/**': '/producers',

  // If user-provided or unaudited content could be loaded in a given
  // page, make sure the root active key is not around on these pages.
  'active/**': '/@[\\w\\.]'
}
*/
