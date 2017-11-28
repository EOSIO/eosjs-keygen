<!--[![Build Status](https://travis-ci.org/EOSIO/eosjs-keygen.svg?branch=master)](https://travis-ci.org/EOSIO/eosjs-keygen)-->
[![NPM](https://img.shields.io/npm/v/eosjs-keygen.svg)](https://www.npmjs.org/package/eosjs-keygen)

# Repository

General purpose library for private key storage and key management.

Status: **Active Development, breaking changes..**

### Usage

```javascript
let {Keystore, Keygen} = require('eosjs-keygen')

Eos = require('eosjs')

Keygen.generateMasterKeys().then(keys => {
  // create blockchain account called 'myaccount'
  console.log(keys)
})

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

eos.getAccount('myaccount').then(account => {
  keystore.deriveKeys('myaccount', account.permissions)
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
npm install
npm run build
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
