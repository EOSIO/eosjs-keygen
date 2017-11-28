const assert = require('assert')

module.exports = Storage

/**
  Generic key based storage.  Uses a prefix-friendly key encoding for searching.
*/
function Storage(namespace) {

  function createKey(...elements) {
    const key = JSON.stringify([namespace, ...elements])
    // remove [ and ] so key is prefix-friendly for searching
    const keyTrim = key.substring(1, key.length - 1)
    return Buffer.from(keyTrim).toString('hex')
  }

  /**
    Save but do not remove a value from state.

    @throws {AssertionError} immutable
  */
  function save(state, key, value, immutable = true) {
    assert.equal(typeof key, 'string', 'key')
    if(value == null) {
      state[key] = value
      return
    }

    assert.equal(typeof value, 'string', 'value')

    const existing = state[key]
    const dirty = existing != value
    assert(existing == null || !dirty || !immutable, 'immutable')

    if(dirty) {
      // console.log('save', key, value)
      state[key] = value
    }
  }

  /**
    @arg {object} state - localStorage, etc
    @arg {Array<string>} keyPrefix - index, if partial path, the rest of the
    key elements end up in keySuffix.

    @arg {function} callback(keySuffix = [], value) 
  */
  function query(state, keyPrefix, callback) {
    const prefix = createKey(...keyPrefix)
    for(const key of Object.keys(state)) {
      if(key.indexOf(prefix) !== 0) {
        continue
      }
      const decodedKeys = JSON.parse('[' + Buffer.from(key, 'hex') + ']')
      callback(decodedKeys.slice(keyPrefix.length + 1), state[key])
    }
  }

  return {
    createKey,
    save,
    query
  }
}