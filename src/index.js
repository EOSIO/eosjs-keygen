const Keystore = require('./keystore')
const Keygen = require('./keygen')

const ecc = require('eosjs-ecc')

module.exports = {
  Keystore,
  Keygen,
  modules: {
    ecc
  }
}