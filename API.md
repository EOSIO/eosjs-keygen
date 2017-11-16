## Functions

<dl>
<dt><a href="#Session">Session(userId, [config])</a></dt>
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
<dt><a href="#masterPrivateKey">masterPrivateKey</a> : <code>string</code></dt>
<dd><p>Master Private Key.  Strong random key used to derive all other key types.
  (PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp, &#39;PW&#39; + wif)</p>
</dd>
<dt><a href="#owner">owner</a> : <code><a href="#wif">wif</a></code></dt>
<dd><p>Cold storage / recovery key</p>
</dd>
<dt><a href="#active">active</a> : <code><a href="#wif">wif</a></code></dt>
<dd><p>Spending key</p>
</dd>
<dt><a href="#parentPrivateKey">parentPrivateKey</a> : <code><a href="#masterPrivateKey">masterPrivateKey</a></code> | <code><a href="#wif">wif</a></code></dt>
<dd><p>Master private key or one of its derived private keys.</p>
</dd>
<dt><a href="#path">path</a> : <code>string</code></dt>
<dd><p>Key derviation path (<code>master</code>, <code>owner</code>, <code>owner/active</code>, <code>myaccount/mypermission</code>, ..)</p>
</dd>
<dt><a href="#accountPermissions">accountPermissions</a> : <code>object</code></dt>
<dd><p>Permissions object from Eos blockchain obtained via get_account.
  See chain API get_account =&gt; account.permissions.</p>
</dd>
<dt><a href="#minimatch">minimatch</a> : <code>string</code></dt>
<dd><p>Glob matching expressions (<code>myaccount/*</code>, <code>myaccount/**</code>).</p>
</dd>
<dt><a href="#RegMatch">RegMatch</a> : <code>string</code> | <code>RegExp</code></dt>
<dd><p>A valid regular expression string or a regular expression object. If a string
  is provided it is converted to a RegExp by inspecting and optionally adding
  common suffixes and prefixes.</p>
<p>  If a RegExp object is provided, it is used without modification.</p>
</dd>
<dt><a href="#RegexpSet">RegexpSet</a> : <code><a href="#RegMatch">RegMatch</a></code> | <code><a href="#RegMatch">Array.&lt;RegMatch&gt;</a></code></dt>
<dd></dd>
</dl>

<a name="Session"></a>

## Session(userId, [config])
Provides private key management and storage.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| userId | <code>string</code> |  | An stable identifier (or hash) for the user. Make   sure the id is stored externally before it is used here.  The Id may   be created before a blockchain account name is available.  An account   name may be assigned later in the login function. |
| [config] | <code>object</code> |  |  |
| [config.timeout] | <code>number</code> | <code>30</code> | minutes |
| [config.urlRules] | <code>Object.&lt;minimatch, RegexpSet&gt;</code> |  | Specify which type   of private key will be available on certain pages of the application. |

**Example**  
```js
Session = require('eosjs-keygen')

config = {
  timeout: 30,
  urlRules: {
    'owner': 'account_recovery',
    'owner/active': '@${accountName}/transfers',
    '${accountName}/**': '@${accountName}'
  }
}

session = Session('unique_userId', config)

session.login(...)
```

* [Session(userId, [config])](#Session)
    * _static_
        * [.generateMasterKeys(cpuEntropyBits)](#Session.generateMasterKeys) ⇒ <code>object</code>
        * [.addEntropy()](#Session.addEntropy)
    * _inner_
        * [~login(accountName, accountPermissions, parentPrivateKey, [saveLoginsByPath])](#Session..login)
        * [~logout()](#Session..logout)
        * [~timeUntilExpire()](#Session..timeUntilExpire) ⇒ <code>number</code>
        * [~keepAlive()](#Session..keepAlive)

<a name="Session.generateMasterKeys"></a>

### Session.generateMasterKeys(cpuEntropyBits) ⇒ <code>object</code>
New accounts will call this to generate a new keyset..

  A password manager or backup should save the returned
  {masterPrivateKey} for later login.

**Kind**: static method of [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| cpuEntropyBits | <code>number</code> | Use 0 for fast testing, 128 (default) takes a second |

**Example**  
```js
{
  masterPrivateKey, // <= place in a password input field (password manager)
  privateKeys: {owner, active},
  publicKeys: {owner, active}
}
```
<a name="Session.addEntropy"></a>

### Session.addEntropy()
**Kind**: static method of [<code>Session</code>](#Session)  
**See**: addEntropy https://github.com/EOSIO/eosjs-ecc/blob/master/src/key_utils.js  
<a name="Session..login"></a>

### Session~login(accountName, accountPermissions, parentPrivateKey, [saveLoginsByPath])
Creates private keys and saves them in the keystore for use on demand.  This
    may be called to add additional keys which were removed as a result of Url
    navigation or from calling logout.

**Kind**: inner method of [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| accountName | <code>string</code> | Blockchain account.name (example: myaccount) |
| accountPermissions | [<code>accountPermissions</code>](#accountPermissions) | Permissions object from Eos     blockchain via get_account.  This is used to validate the parentPrivateKey     and derive additional permission keys.  This allows this session     to detect incorrect passwords early before trying to sign a transaction.     See Chain API `get_account => account.permissions`. |
| parentPrivateKey | [<code>parentPrivateKey</code>](#parentPrivateKey) | Master password (masterPrivateKey),     active, owner, or other permission key. |
| [saveLoginsByPath] | [<code>Array.&lt;minimatch&gt;</code>](#minimatch) | These permissions will be     saved to disk.  An exception is thrown if a master, owner or active key     save is attempted. (example: ['myaccount/**', ..]) |

<a name="Session..logout"></a>

### Session~logout()
Removes any saved keys on disk and clears keys in memory.  Call only when
    the user chooses "logout."  Do not call when the application exits.

**Kind**: inner method of [<code>Session</code>](#Session)  
<a name="Session..timeUntilExpire"></a>

### Session~timeUntilExpire() ⇒ <code>number</code>
**Kind**: inner method of [<code>Session</code>](#Session)  
**Returns**: <code>number</code> - 0 (expired) or milliseconds until expire  
<a name="Session..keepAlive"></a>

### Session~keepAlive()
Keep alive (prevent expiration).

**Kind**: inner method of [<code>Session</code>](#Session)  
<a name="pubkey"></a>

## pubkey : <code>string</code>
Public Key (EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV)

**Kind**: global typedef  
<a name="wif"></a>

## wif : <code>string</code>
[Wallet Import Format](https://en.bitcoin.it/wiki/Wallet_import_format)
    (5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp)

**Kind**: global typedef  
<a name="masterPrivateKey"></a>

## masterPrivateKey : <code>string</code>
Master Private Key.  Strong random key used to derive all other key types.
  (PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp, 'PW' + wif)

**Kind**: global typedef  
<a name="owner"></a>

## owner : [<code>wif</code>](#wif)
Cold storage / recovery key

**Kind**: global typedef  
<a name="active"></a>

## active : [<code>wif</code>](#wif)
Spending key

**Kind**: global typedef  
<a name="parentPrivateKey"></a>

## parentPrivateKey : [<code>masterPrivateKey</code>](#masterPrivateKey) \| [<code>wif</code>](#wif)
Master private key or one of its derived private keys.

**Kind**: global typedef  
<a name="path"></a>

## path : <code>string</code>
Key derviation path (`master`, `owner`, `owner/active`, `myaccount/mypermission`, ..)

**Kind**: global typedef  
<a name="accountPermissions"></a>

## accountPermissions : <code>object</code>
Permissions object from Eos blockchain obtained via get_account.
  See chain API get_account => account.permissions.

**Kind**: global typedef  
**Example**  
```js
const accountPermissions = [{
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
```
<a name="minimatch"></a>

## minimatch : <code>string</code>
Glob matching expressions (`myaccount/*`, `myaccount/**`).

**Kind**: global typedef  
**See**: https://www.npmjs.com/package/minimatch  
<a name="RegMatch"></a>

## RegMatch : <code>string</code> \| <code>RegExp</code>
A valid regular expression string or a regular expression object. If a string
  is provided it is converted to a RegExp by inspecting and optionally adding
  common suffixes and prefixes.

  If a RegExp object is provided, it is used without modification.

**Kind**: global typedef  
**Example**  
```js
// A string RegMatch is handled as follows:

// If it does not sart with ^, root with http or https then any domain
const prefix = re.charAt(0) === '^' ? '' : '^https?://[^/]+/'

// If it does not end with $, allow any valid Url suffix
const suffix = re.charAt(re.length - 1) === '$' ? '' : '([/\?#].*)?$'

return new RegExp(prefix + re + suffix, 'i')
```
<a name="RegexpSet"></a>

## RegexpSet : [<code>RegMatch</code>](#RegMatch) \| [<code>Array.&lt;RegMatch&gt;</code>](#RegMatch)
**Kind**: global typedef  
