## Functions

<dl>
<dt><a href="#Session">Session(accountName, [config])</a></dt>
<dd><p>Provides private key management and storage.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#pubkey">pubkey</a> : <code>string</code></dt>
<dd><p>Public Key (EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV)</p>
</dd>
<dt><a href="#wif">wif</a> : <code>string</code></dt>
<dd><p><a href="https://en.bitcoin.it/wiki/Wallet_import_format">Wallet Import Format</a>
  (5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp)</p>
</dd>
<dt><a href="#privateKey">privateKey</a> : <code>object</code></dt>
<dd><p>Private key object from eosjs-ecc.</p>
</dd>
<dt><a href="#masterPrivateKey">masterPrivateKey</a> : <code>string</code></dt>
<dd><p>Master Private Key.  Strong random key used to derive all other key types.
  Has a &#39;PW&#39; prefix followed by a valid wif. (<code>&#39;PW&#39; + wif ===
  &#39;PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp&#39;</code>)</p>
</dd>
<dt><a href="#owner">owner</a> : <code><a href="#wif">wif</a></code></dt>
<dd><p>Cold storage / recovery key.  Has authoritiy to do everything including
  account recovery.</p>
</dd>
<dt><a href="#active">active</a> : <code><a href="#wif">wif</a></code></dt>
<dd><p>Spending key.  Has the authority to do everything except account recovery.</p>
</dd>
<dt><a href="#parentPrivateKey">parentPrivateKey</a> : <code><a href="#masterPrivateKey">masterPrivateKey</a></code> | <code><a href="#wif">wif</a></code></dt>
<dd><p>Master private key or one of its derived private keys.</p>
</dd>
<dt><a href="#auth">auth</a> : <code>object</code></dt>
<dd><p>Signing Keys and(or) Accounts each having a weight that when matched in
  the signatures should accumulate to meet or exceed the auth&#39;s total threshold.</p>
</dd>
<dt><a href="#accountPermissions">accountPermissions</a> : <code>object</code></dt>
<dd><p>Permissions object from Eos blockchain obtained via get_account.</p>
<p>  See chain API get_account =&gt; account.permissions.</p>
</dd>
<dt><a href="#keyPath">keyPath</a> : <code>string</code></dt>
<dd></dd>
<dt><a href="#minimatch">minimatch</a> : <code>string</code></dt>
<dd><p>Glob matching expressions (<code>active</code>, <code>active/**</code>, <code>owner/*</code>).</p>
</dd>
<dt><a href="#keyPathMatcher">keyPathMatcher</a> : <code><a href="#minimatch">minimatch</a></code></dt>
<dd><p>Key derviation path (<code>owner</code>, <code>active/*</code>, <code>active/**</code>, <code>active/mypermission</code>)</p>
</dd>
<dt><a href="#uriData">uriData</a> : <code>string</code></dt>
<dd><p>A URI without the prefixing scheme, host, port.</p>
</dd>
<dt><a href="#uriMatcher">uriMatcher</a> : <code>string</code></dt>
<dd><p>A valid regular expression string.  The provided string it modified when
  it is converted to a RegExp object:</p>
<ul>
<li>A start of match is implied (<code>^</code> is always added, do not add one)</li>
<li>Unless the uriPath ends with <code>$</code>, automatically matches query parameters
and fragment (hash tag info).</li>
<li>The RegExp that is created is always case-insensitive to help a
non-canonical path match.  Uri paths should be canonical though.</li>
</ul>
</dd>
<dt><a href="#uriMatchers">uriMatchers</a> : <code><a href="#uriMatcher">uriMatcher</a></code> | <code><a href="#uriMatcher">Array.&lt;uriMatcher&gt;</a></code></dt>
<dd></dd>
<dt><a href="#uriRule">uriRule</a> : <code>Object.&lt;keyPathMatcher, uriMatchers&gt;</code></dt>
<dd></dd>
<dt><a href="#uriRules">uriRules</a> : <code><a href="#uriRule">Object.&lt;uriRule&gt;</a></code></dt>
<dd><p>Define rules that says which private keys may exist within given locations
  of the application.  If a rule is not found or does not match, the session
  will remove the key.  The UI can prompt the user to obtain the needed key
  again.</p>
<p>  For any non-trivial configuration, implementions should create a unit test
  that will test the actual configuration used in the application
  (use ./uri-rules.test.js as a template).</p>
<p>  Paths imply that active is always derived from owner.  So, instead of writing
  <code>owner/active/**</code> the path must be written as <code>active/**</code>.</p>
</dd>
</dl>

<a name="Session"></a>

## Session(accountName, [config])
Provides private key management and storage.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accountName | <code>string</code> |  | Blockchain account name. |
| [config] | <code>object</code> |  |  |
| [config.timeoutInMin] | <code>number</code> | <code>30</code> |  |
| [config.uriRules] | [<code>uriRules</code>](#uriRules) |  | Specify which type of private key will   be available on certain pages of the application.  Lock it down as much as   possible and later re-prompt the user if a key is needed. |

**Example**  
```js

Session = require('eosjs-keygen') // Session = require('./src')
Eos = require('eosjs')

Session.generateMasterKeys().then(keys => {
  // create blockchain account called 'myaccount'
  console.log(keys)
})

// Todo, move to session-factory.js
sessionConfig = {
  timeoutInMin: 30,
  uriRules: {
    'owner' : '/account_recovery',
    'active': '/(transfer|contracts)',
    'active/**': '/producers'
  }
}

// Todo, move to session-factory.js
session = Session('myaccount', sessionConfig)

eos = Eos.Testnet({keyProvider: session.keyProvider})

eos.getAccount('myaccount').then(account => {
  // Todo, move to session-factory.js
  session.login('myaccount', account.permissions)
})
```

* [Session(accountName, [config])](#Session)
    * _static_
        * [.wipeAll](#Session.wipeAll)
        * [.generateMasterKeys(cpuEntropyBits)](#Session.generateMasterKeys) ⇒ <code>Promise</code>
    * _inner_
        * [~login(parentPrivateKey, [saveLoginsByPath], accountPermissions)](#Session..login)
        * [~logout()](#Session..logout)
        * [~timeUntilExpire()](#Session..timeUntilExpire) ⇒ <code>number</code>
        * [~keepAlive()](#Session..keepAlive)
        * [~keyProvider()](#Session..keyProvider)

<a name="Session.wipeAll"></a>

### Session.wipeAll
Erase all traces of this session (for all users).

**Kind**: static property of [<code>Session</code>](#Session)  
<a name="Session.generateMasterKeys"></a>

### Session.generateMasterKeys(cpuEntropyBits) ⇒ <code>Promise</code>
New accounts will call this to generate a new keyset..

  A password manager or backup should save (at the very minimum) the returned
  {masterPrivateKey} for later login.  The owner and active can be re-created
  from the masterPrivateKey.  It is still a good idea to save all information
  in the backup for easy reference.

**Kind**: static method of [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| cpuEntropyBits | <code>number</code> | Use 0 for fast testing, 128 (default) takes a   second |

**Example**  
```js
{
  masterPrivateKey, // <= place in a password input field (password manager)
  privateKeys: {owner, active}, // <= derived from masterPrivateKey
  publicKeys: {owner, active} // <= derived from masterPrivateKey
}
```
<a name="Session..login"></a>

### Session~login(parentPrivateKey, [saveLoginsByPath], accountPermissions)
Creates private keys and saves them in the keystore for use on demand.  This
    may be called to add additional keys which were removed as a result of Uri
    navigation or from calling logout.

    It is possible for the same user to login more than once using a different
    parentPrivateKey (master password or private key).  The purpose is to add
    additional keys to the session.

**Kind**: inner method of [<code>Session</code>](#Session)  
**Throws**:

- <code>Error</code> 'invalid login'


| Param | Type | Description |
| --- | --- | --- |
| parentPrivateKey | [<code>parentPrivateKey</code>](#parentPrivateKey) | Master password (masterPrivateKey),     active, owner, or other permission key. |
| [saveLoginsByPath] | [<code>Array.&lt;keyPathMatcher&gt;</code>](#keyPathMatcher) | These permissions will be     saved to disk. (example: [`active/**`, ..]). A timeout will not     expire, logout to remove.     An exception is thrown if an owner or active key save is attempted. |
| accountPermissions | [<code>accountPermissions</code>](#accountPermissions) | Permissions object from Eos     blockchain via get_account.  This is used to validate the parentPrivateKey     and derive additional permission keys.  This allows this session     to detect incorrect passwords early before trying to sign a transaction.     See Chain API `get_account => account.permissions`. |

<a name="Session..logout"></a>

### Session~logout()
Removes any saved keys on disk and clears keys in memory.  Call only when
    the user chooses "logout."  Do not call when the application exits.

**Kind**: inner method of [<code>Session</code>](#Session)  
<a name="Session..timeUntilExpire"></a>

### Session~timeUntilExpire() ⇒ <code>number</code>
**Kind**: inner method of [<code>Session</code>](#Session)  
**Returns**: <code>number</code> - 0 (expired), null, or milliseconds until expire  
<a name="Session..keepAlive"></a>

### Session~keepAlive()
Keep alive (prevent expiration).  Called automatically if Uri navigation
    happens or keys are obtained from the keyStore.  It may be necessary
    to call this manually.

**Kind**: inner method of [<code>Session</code>](#Session)  
<a name="Session..keyProvider"></a>

### Session~keyProvider()
**Kind**: inner method of [<code>Session</code>](#Session)  
**See**: https://github.com/eosio/eosjs  
<a name="pubkey"></a>

## pubkey : <code>string</code>
Public Key (EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV)

**Kind**: global typedef  
<a name="wif"></a>

## wif : <code>string</code>
[Wallet Import Format](https://en.bitcoin.it/wiki/Wallet_import_format)
  (5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp)

**Kind**: global typedef  
<a name="privateKey"></a>

## privateKey : <code>object</code>
Private key object from eosjs-ecc.

**Kind**: global typedef  
<a name="masterPrivateKey"></a>

## masterPrivateKey : <code>string</code>
Master Private Key.  Strong random key used to derive all other key types.
  Has a 'PW' prefix followed by a valid wif. (`'PW' + wif ===
  'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'`)

**Kind**: global typedef  
<a name="owner"></a>

## owner : [<code>wif</code>](#wif)
Cold storage / recovery key.  Has authoritiy to do everything including
  account recovery.

**Kind**: global typedef  
<a name="active"></a>

## active : [<code>wif</code>](#wif)
Spending key.  Has the authority to do everything except account recovery.

**Kind**: global typedef  
<a name="parentPrivateKey"></a>

## parentPrivateKey : [<code>masterPrivateKey</code>](#masterPrivateKey) \| [<code>wif</code>](#wif)
Master private key or one of its derived private keys.

**Kind**: global typedef  
<a name="auth"></a>

## auth : <code>object</code>
Signing Keys and(or) Accounts each having a weight that when matched in
  the signatures should accumulate to meet or exceed the auth's total threshold.

**Kind**: global typedef  
**Example**  
```js
required_auth: {
  threshold: 1,
  keys: [{
      key: 'EOS78Cs5HPKY7HKHrSMnR76uj7yeajPuNwSH1Fsria3sJuufwE3Zd',
      weight: 1
    }
  ],
  accounts: []
}
```
<a name="accountPermissions"></a>

## accountPermissions : <code>object</code>
Permissions object from Eos blockchain obtained via get_account.

  See chain API get_account => account.permissions.

**Kind**: global typedef  
**Example**  
```js
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
```
<a name="keyPath"></a>

## keyPath : <code>string</code>
**Kind**: global typedef  
**See**: [validate.path(keyPath)](./validate.js)  
**Example**  
```js
'owner', 'active', 'active/mypermission'
```
<a name="minimatch"></a>

## minimatch : <code>string</code>
Glob matching expressions (`active`, `active/**`, `owner/*`).

**Kind**: global typedef  
**See**: https://www.npmjs.com/package/minimatch  
<a name="keyPathMatcher"></a>

## keyPathMatcher : [<code>minimatch</code>](#minimatch)
Key derviation path (`owner`, `active/*`, `active/**`, `active/mypermission`)

**Kind**: global typedef  
<a name="uriData"></a>

## uriData : <code>string</code>
A URI without the prefixing scheme, host, port.

**Kind**: global typedef  
**Example**  
```js
'/producers', '/account_recovery#name=..'
```
<a name="uriMatcher"></a>

## uriMatcher : <code>string</code>
A valid regular expression string.  The provided string it modified when
  it is converted to a RegExp object:

  - A start of match is implied (`^` is always added, do not add one)
  - Unless the uriPath ends with `$`, automatically matches query parameters
    and fragment (hash tag info).
  - The RegExp that is created is always case-insensitive to help a
    non-canonical path match.  Uri paths should be canonical though.

**Kind**: global typedef  
**Example**  
```js
'/(transfer|contracts)', '/bare-uri$'
  
```
**Example**  
```js
function createPathMatcher(path) {
  // Ensure match starts at the begining
  const prefix = '^'

  // If path matcher does not end with $, allow Uri query and fragment
  const suffix = path.charAt(path.length - 1) === '$' ? '' : '\/?([\?#].*)?$'

  // Path matches are case in-sensitive
  return new RegExp(prefix + path + suffix, 'i')
}
```
<a name="uriMatchers"></a>

## uriMatchers : [<code>uriMatcher</code>](#uriMatcher) \| [<code>Array.&lt;uriMatcher&gt;</code>](#uriMatcher)
**Kind**: global typedef  
<a name="uriRule"></a>

## uriRule : <code>Object.&lt;keyPathMatcher, uriMatchers&gt;</code>
**Kind**: global typedef  
**Example**  
```js
{
  'owner': '/account_recovery$', // <= $ prevents query or fragment params
  'active': ['/transfer', '/contracts']
}
```
<a name="uriRules"></a>

## uriRules : [<code>Object.&lt;uriRule&gt;</code>](#uriRule)
Define rules that says which private keys may exist within given locations
  of the application.  If a rule is not found or does not match, the session
  will remove the key.  The UI can prompt the user to obtain the needed key
  again.

  For any non-trivial configuration, implementions should create a unit test
  that will test the actual configuration used in the application
  (use ./uri-rules.test.js as a template).

  Paths imply that active is always derived from owner.  So, instead of writing
  `owner/active/**` the path must be written as `active/**`.

**Kind**: global typedef  
**Example**  
```js
uriRules = { // Hypothetical examples
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
```
