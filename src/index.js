
const Session = require('./session')

module.exports = Session

/**
  Public Key

  @example 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV' 

  @typedef {string} pubkey
*/

/**
    [Wallet Import Format](https://en.bitcoin.it/wiki/Wallet_import_format)
    @example '5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'

    @typedef {string} wif
*/

/**
  Master Private Key.  Strong random key used to derive all other key types.

  @example `PW${wif}`
  @example 'PW5JMx76CTUTXxpAbwAqGMMVzSeJaP5UVTT5c2uobcpaMUdLAphSp'

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
  Key derviation path

  @example 'master'
  @example 'owner'
  @example 'owner/active'
  @example 'myaccount/mypermission'

  @typedef {string} path
*/
