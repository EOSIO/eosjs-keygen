/* eslint-env mocha */
const assert = require('assert')

const KeyStore = require('./keystore')

describe('Store', () => {

  it('wipeAll', () => {
    KeyStore.wipeAll()
  })

})