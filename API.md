## Modules

<dl>
<dt><a href="#module_Keystore">Keystore</a></dt>
<dd></dd>
<dt><a href="#module_Keygen">Keygen</a></dt>
<dd></dd>
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
<dt><a href="#keyPathPrivate">keyPathPrivate</a> : <code>object</code></dt>
<dd><p>An expanded version of a private key, a keypath (&#39;active/mypermission&#39;),
  and its calculated public key (for performance reasons).</p>
</dd>
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
<dd><p>A valid regular expression string.  The provided string is modified when
  it is converted to a RegExp object:</p>
<ul>
<li>A start of line match is implied (<code>^</code> is always added, do not add one)</li>
<li>Unless the uriPath ends with <code>$</code>, automatically matches query parameters
and fragment (hash tag info).</li>
<li>The RegExp that is created is always case-insensitive to help a
non-canonical path match.  Uri paths should be canonical.</li>
</ul>
</dd>
<dt><a href="#uriMatchers">uriMatchers</a> : <code><a href="#uriMatcher">uriMatcher</a></code> | <code><a href="#uriMatcher">Array.&lt;uriMatcher&gt;</a></code></dt>
<dd></dd>
<dt><a href="#uriRule">uriRule</a> : <code>Object.&lt;keyPathMatcher, uriMatchers&gt;</code></dt>
<dd></dd>
<dt><a href="#uriRules">uriRules</a> : <code><a href="#uriRule">Object.&lt;uriRule&gt;</a></code></dt>
<dd><p>Define rules that say which private keys may exist within given locations
  of the application.  If a rule is not found or does not match, the keystore
  will remove the key.  The UI can prompt the user to obtain the needed key
  again.</p>
<p>  For any non-trivial configuration, implementions should create a unit test
  that will test the actual configuration used in the application
  (see <code>./uri-rules.test.js</code> for a template).</p>
<p>  Paths imply that active is always derived from owner.  So, instead of writing
  <code>owner/active/**</code> the path must be written as <code>active/**</code>.</p>
</dd>
</dl>

<a name="module_Keystore"></a>

## Keystore

* [Keystore](#module_Keystore)
    * [~Keystore(accountName, [config])](#module_Keystore..Keystore)
        * _static_
            * [.wipeAll()](#module_Keystore..Keystore.wipeAll)
        * _inner_
            * [~deriveKeys(params)](#module_Keystore..Keystore..deriveKeys)
            * [~getKeyPaths()](#module_Keystore..Keystore..getKeyPaths) ⇒ <code>object</code>
            * [~getPublicKeys([keyPathMatcher])](#module_Keystore..Keystore..getPublicKeys) ⇒ [<code>Array.&lt;pubkey&gt;</code>](#pubkey)
            * [~getPublicKey()](#module_Keystore..Keystore..getPublicKey) ⇒ [<code>pubkey</code>](#pubkey)
            * [~getPrivateKey()](#module_Keystore..Keystore..getPrivateKey) ⇒ [<code>wif</code>](#wif)
            * [~logout()](#module_Keystore..Keystore..logout)
            * [~timeUntilExpire()](#module_Keystore..Keystore..timeUntilExpire) ⇒ <code>number</code>
            * [~keepAlive()](#module_Keystore..Keystore..keepAlive)
            * [~keyProvider()](#module_Keystore..Keystore..keyProvider)

<a name="module_Keystore..Keystore"></a>

### Keystore~Keystore(accountName, [config])
Provides private key management and storage.

  This keystore does not query the blockchain or any external services.
  Removing keys here does not affect the blockchain.

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accountName | <code>string</code> |  | Blockchain account name. |
| [config] | <code>object</code> |  |  |
| [config.timeoutInMin] | <code>number</code> | <code>30</code> |  |
| [config.uriRules] | [<code>uriRules</code>](#uriRules) |  | Specify which type of private key will   be available on certain pages of the application.  Lock it down as much as   possible and later re-prompt the user if a key is needed.  Default is to   allow all. |


* [~Keystore(accountName, [config])](#module_Keystore..Keystore)
    * _static_
        * [.wipeAll()](#module_Keystore..Keystore.wipeAll)
    * _inner_
        * [~deriveKeys(params)](#module_Keystore..Keystore..deriveKeys)
        * [~getKeyPaths()](#module_Keystore..Keystore..getKeyPaths) ⇒ <code>object</code>
        * [~getPublicKeys([keyPathMatcher])](#module_Keystore..Keystore..getPublicKeys) ⇒ [<code>Array.&lt;pubkey&gt;</code>](#pubkey)
        * [~getPublicKey()](#module_Keystore..Keystore..getPublicKey) ⇒ [<code>pubkey</code>](#pubkey)
        * [~getPrivateKey()](#module_Keystore..Keystore..getPrivateKey) ⇒ [<code>wif</code>](#wif)
        * [~logout()](#module_Keystore..Keystore..logout)
        * [~timeUntilExpire()](#module_Keystore..Keystore..timeUntilExpire) ⇒ <code>number</code>
        * [~keepAlive()](#module_Keystore..Keystore..keepAlive)
        * [~keyProvider()](#module_Keystore..Keystore..keyProvider)

<a name="module_Keystore..Keystore.wipeAll"></a>

#### Keystore.wipeAll()
Erase all traces of this keystore (for all users).

**Kind**: static method of [<code>Keystore</code>](#module_Keystore..Keystore)  
<a name="module_Keystore..Keystore..deriveKeys"></a>

#### Keystore~deriveKeys(params)
Derives and saves private keys used to sign transactions.  This may be
    called from a login dialog.  Keys may be removed as during Uri
    navigation or when calling logout.

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
**Throws**:

- <code>Error</code> 'invalid login'


| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> |  |
| params.parent | [<code>parentPrivateKey</code>](#parentPrivateKey) | Master password (masterPrivateKey),     active, owner, or other permission key. |
| [params.saveKeyMatches] | [<code>Array.&lt;keyPathMatcher&gt;</code>](#keyPathMatcher) | These permissions     will be saved to disk. (example: [`active/**`, ..]). |
| [params.accountPermissions] | [<code>accountPermissions</code>](#accountPermissions) | Permissions object     from Eos blockchain via get_account.  This is used to validate the parent     and derive additional permission keys.  This allows this keystore to detect     incorrect passwords early before trying to sign a transaction.     See Chain API `get_account => account.permissions`. |

<a name="module_Keystore..Keystore..getKeyPaths"></a>

#### Keystore~getKeyPaths() ⇒ <code>object</code>
Return paths for all available keys.  Empty array is used if there are
    no keys.

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
**Returns**: <code>object</code> - {pubkey: Array<pubkey>, wif: Array<wif>}  
<a name="module_Keystore..Keystore..getPublicKeys"></a>

#### Keystore~getPublicKeys([keyPathMatcher]) ⇒ [<code>Array.&lt;pubkey&gt;</code>](#pubkey)
Return public keys for a path matcher (all keys by default).

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
**Returns**: [<code>Array.&lt;pubkey&gt;</code>](#pubkey) - public keys or empty array  

| Param | Type | Default |
| --- | --- | --- |
| [keyPathMatcher] | [<code>keyPathMatcher</code>](#keyPathMatcher) | <code>&#x27;**&#x27;</code> | 

<a name="module_Keystore..Keystore..getPublicKey"></a>

#### Keystore~getPublicKey() ⇒ [<code>pubkey</code>](#pubkey)
Fetch or derive a public key.

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
**Returns**: [<code>pubkey</code>](#pubkey) - or null  
<a name="module_Keystore..Keystore..getPrivateKey"></a>

#### Keystore~getPrivateKey() ⇒ [<code>wif</code>](#wif)
Fetch or derive a private key.

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
**Returns**: [<code>wif</code>](#wif) - or null (denied for location) or undefined (not available)  
<a name="module_Keystore..Keystore..logout"></a>

#### Keystore~logout()
Removes any saved keys on disk and clears keys in memory.  Call only when
    the user chooses "logout."  Do not call when the application exits.

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
<a name="module_Keystore..Keystore..timeUntilExpire"></a>

#### Keystore~timeUntilExpire() ⇒ <code>number</code>
**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
**Returns**: <code>number</code> - 0 (expired), null, or milliseconds until expire  
<a name="module_Keystore..Keystore..keepAlive"></a>

#### Keystore~keepAlive()
Keep alive (prevent expiration).  Called automatically if Uri navigation
    happens or keys are required.  It may be necessary to call this manually.

**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
<a name="module_Keystore..Keystore..keyProvider"></a>

#### Keystore~keyProvider()
**Kind**: inner method of [<code>Keystore</code>](#module_Keystore..Keystore)  
**See**: https://github.com/eosio/eosjs  
<a name="module_Keygen"></a>

## Keygen

* [Keygen](#module_Keygen)
    * [~generateMasterKeys(cpuEntropyBits)](#module_Keygen..generateMasterKeys) ⇒ <code>Promise</code>
    * [~authsByPath(accountPermissions)](#module_Keygen..authsByPath) ⇒ <code>object.&lt;keyPathAuth&gt;</code>
    * [~genKeys([masterPrivateKey], [cpuEntropyBits])](#module_Keygen..genKeys)
    * [~deriveKeys()](#module_Keygen..deriveKeys) ⇒ <code>Array</code>
    * [~keyPathAuth](#module_Keygen..keyPathAuth) : <code>Object.&lt;keyPath, auth&gt;</code>

<a name="module_Keygen..generateMasterKeys"></a>

### Keygen~generateMasterKeys(cpuEntropyBits) ⇒ <code>Promise</code>
New accounts will call this to create a new keyset..

  A password manager or backup should save (at the very minimum) the returned
  {masterPrivateKey} for later login.  The owner and active can be re-created
  from the masterPrivateKey.  It is still a good idea to save all information
  in the backup for easy reference.

**Kind**: inner method of [<code>Keygen</code>](#module_Keygen)  

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
<a name="module_Keygen..authsByPath"></a>

### Keygen~authsByPath(accountPermissions) ⇒ <code>object.&lt;keyPathAuth&gt;</code>
Recursively create keyPath using the parent links in the blockchain
  account's permission object.  Under this keyPath, store the full
  required_auth structure for later inspection.

**Kind**: inner method of [<code>Keygen</code>](#module_Keygen)  

| Param | Type |
| --- | --- |
| accountPermissions | [<code>accountPermissions</code>](#accountPermissions) | 

<a name="module_Keygen..genKeys"></a>

### Keygen~genKeys([masterPrivateKey], [cpuEntropyBits])
Synchronous version of generateMasterKeys.

**Kind**: inner method of [<code>Keygen</code>](#module_Keygen)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [masterPrivateKey] | [<code>masterPrivateKey</code>](#masterPrivateKey) | <code></code> | When null, a random key   is created.. |
| [cpuEntropyBits] | <code>number</code> | <code></code> | null to use CPU entropy or 0 for   fast test keys |

<a name="module_Keygen..deriveKeys"></a>

### Keygen~deriveKeys() ⇒ <code>Array</code>
Derive missing intermediate keys and paths for the given path.

**Kind**: inner method of [<code>Keygen</code>](#module_Keygen)  
**Returns**: <code>Array</code> - [{path, privateKey}] newly derived keys or empty array (keys already
  exist or can't be derived).  
<a name="module_Keygen..keyPathAuth"></a>

### Keygen~keyPathAuth : <code>Object.&lt;keyPath, auth&gt;</code>
**Kind**: inner typedef of [<code>Keygen</code>](#module_Keygen)  
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
<a name="keyPathPrivate"></a>

## keyPathPrivate : <code>object</code>
An expanded version of a private key, a keypath ('active/mypermission'),
  and its calculated public key (for performance reasons).

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| wif | [<code>wif</code>](#wif) | 
| pubkey | [<code>pubkey</code>](#pubkey) | 
| path | [<code>keyPath</code>](#keyPath) | 

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
A valid regular expression string.  The provided string is modified when
  it is converted to a RegExp object:

  - A start of line match is implied (`^` is always added, do not add one)
  - Unless the uriPath ends with `$`, automatically matches query parameters
    and fragment (hash tag info).
  - The RegExp that is created is always case-insensitive to help a
    non-canonical path match.  Uri paths should be canonical.

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
Define rules that say which private keys may exist within given locations
  of the application.  If a rule is not found or does not match, the keystore
  will remove the key.  The UI can prompt the user to obtain the needed key
  again.

  For any non-trivial configuration, implementions should create a unit test
  that will test the actual configuration used in the application
  (see `./uri-rules.test.js` for a template).

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
