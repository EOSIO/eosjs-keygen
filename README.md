<!--[![Build Status](https://travis-ci.org/EOSIO/eosjs-keygen.svg?branch=master)](https://travis-ci.org/EOSIO/eosjs-keygen)-->
[![NPM](https://img.shields.io/npm/v/eosjs-keygen.svg)](https://www.npmjs.org/package/eosjs-keygen)

# Repository

The purpose of this library is for managing keys in local storage.  This is designed to derive and cache keys but also needs a password manager to store a "root" key. This library does not have secure or password protected storage. It does however figure out permission hierarchies and is configurable enough to only store keys you feel are safe to store.

General purpose cryptography is found in [eosjs-ecc](http://github.com/eosio/eosjs-ecc) library.  Hierarchical
deterministic key generation uses PrivateKey.getChildKey in eosjs-ecc.

### Usage

```javascript
let {Keystore, Keygen} = require('eosjs-keygen')
Eos = require('eosjs')

sessionConfig = {
  timeoutInMin: 30,
  uriRules: {
    'owner' : '/account_recovery',
    'active': '/(transfer|contracts)',
    'active/**': '/producers'
  }
}

keystore = Keystore('myaccount', sessionConfig)
eos = Eos.Testnet({keyProvider: keystore.keyProvider})

Keygen.generateMasterKeys().then(keys => {
  // create blockchain account called 'myaccount'
  console.log(keys)

  eos.getAccount('myaccount').then(account => {
    keystore.deriveKeys({
      parent: keys.masterPrivateKey,
      accountPermissions: account.permissions
    })
  })

})
```

See [./API](./API.md)

# Development

```javascript
let {Keystore, Keygen} = require('./src')
```

Use Node v8+ (updates `package-lock.json`)

# Browser

```bash
git clone https://github.com/EOSIO/eosjs-keygen.git
cd eosjs-keygen
yarn
yarn build
# builds: ./dist/eosjs-keygen.js
```

```html
<script src="eosjs-keygen.js"></script>
<script>
//kos.Keystore
//kos.Keygen
//...
</script>
```

# Runtime Environment

Node 6+ and browser (browserify, webpack, etc)

Built with React Native in mind, create an issue if you find a bug.
