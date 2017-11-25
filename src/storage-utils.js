
module.exports = Storage

/**
  Generic key based storage.  Uses a prefix-friendly key encoding for searching.
*/
function Storage(namespace) {

  function key(...elements) {
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
      return
    }

    assert.equal(typeof value, 'string', 'value')

    const existing = state[key]
    const dirty = existing != value
    assert(existing == null || !dirty || !immutable, 'immutable')

    if(dirty) {
      state[key] = value
    }
  }

  function query(state, keyPrefix, callback) {
    const prefix = key(...keyPrefix)
    for(const key of Object.keys(state)) {
      if(key.indexOf(prefix) !== 0) {
        continue
      }
      const decodedKeys = JSON.parse('[' + Buffer.from(key, 'hex') + ']')
      callback(decodedKeys.slice(keys.length + 1), key)
    }
  }

  return {
    key,
    save,
    query
  }
}