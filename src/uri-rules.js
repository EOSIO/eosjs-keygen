const assert = require('assert')
const minimatch = require("minimatch")

const validate = require('./validate')

module.exports = UriRules

/**
  @arg {uriRules}
*/
function UriRules(rules) {
  assert.equal(typeof rules, 'object', 'rules')
  rules = Object.assign({}, rules)

  for(const path in rules) {
    const uriMatchers = rules[path]
    const rePatterns = createUrlRules(uriMatchers)
    rules[path] = rePatterns
  }

  /**
    Separate out paths into Allow and Deny.

    @arg {uriData}

    @arg {Set<keyPath>|Array<keyPath>} paths - key paths: owner, active,
    active/mypermission, etc..  These paths are created from blockchain
    account.permissions and gathered in the keystore.login function.
  
    @return {{allow: Array<keyPath>, deny: Array<keyPath>}} - paths allowed or
    denied under current Uri.  This tells the keystore, according to the
    Uri rules to generate, save, or remove private keys only for these paths.
  */
  function check(uri, paths) {
    return checkUrl(uri, paths, rules)
  }

  /** Just allowed paths */
  function allow(uri, paths) {
    return checkUrl(uri, paths, rules).allow
  }

  /** Just deny paths */
  function deny(uri, paths) {
    return checkUrl(uri, paths, rules).deny
  }

  return {
    check,
    allow,
    deny
  }
}

function createUrlRules(uriMatchers) {
  if(typeof uriMatchers === 'string') {
    uriMatchers = [uriMatchers]
  }
  return uriMatchers.map(uriPattern => {
    assert.equal(typeof uriPattern, 'string', uriPattern)
  
    uriPattern = uriPattern.trim()
    assert.notEqual(uriPattern.charAt(0), '^', 'uriPattern')

    const prefix = '^'

    // Allow: /contracts, /contracts/abc, /contracts#hp=1, /contracts?qp=1
    // Do not allow: /contracts2
    const suffix = uriPattern.charAt(uriPattern.length - 1) === '$' ? '' : '\/?([#\?].*)?$'

    uriPattern = new RegExp(prefix + uriPattern + suffix, 'i')
    return uriPattern
  })
}

/** @private */
function checkUrl(uri, paths, rules) {
  assert.equal(typeof uri, 'string', 'uri')

  if(typeof paths === 'string') {
    paths = [paths]
  }

  assert(paths instanceof Array || paths instanceof Set,
    'paths is a Set or Array')

  for(const path of paths) {
    validate.path(path)
  }

  /**
    Get uri rules (minimatch pattern) for a path (string).

    @arg {string} path

    @return {Array<uriMatchers>} from rules[path] or <b>null</b>
  */
  function fullUrlPathSet(path) {
    const uriPaths = []
    for(const rulePath in rules) {
      let match
      // active key is derived from owner (but this is implied)
      if(minimatch(rulePath, 'owner') && minimatch(path, 'active{,/**}')) {
        match = true
      } else {
        // Paths are derivied, so if any root part of the path matches the
        // minimatch, all the children (being derived) are an implied match too.

        // Check the rule as we re-build the path ..
        const accumulativePath = []
        for(const part of path.split('/')) {
          accumulativePath.push(part)
          match = minimatch(accumulativePath.join('/'), rulePath)
          if(match) {
            break
          }
        }
      }
      // console.log('fullUrlPathSet', path, match ? '==' : '!=', rulePath)
      if(match) {
        uriPaths.push(rules[rulePath])
      }
    }
    return uriPaths.length ? [].concat.apply([], uriPaths) : null
  }

  const allow = [], deny = []
  for(const path of paths) {
    const uriPathSet = fullUrlPathSet(path)
    if(uriPathSet) {
      let oneMatches = false
      for(const uriPathRegExp of uriPathSet) {
        oneMatches = uriPathRegExp.test(uri)
        // console.log('uriPathRegExp', uriPathRegExp, uri, oneMatches)
        if(oneMatches) {
          allow.push(path)
          break
        }
      }
      if(!oneMatches) {
        deny.push(path)
      }
    } else {
      deny.push(path)
      // console.log('Missing uriRule for: ' + uri, path)
    }
  }
  assert.equal(paths.length, allow.length + deny.length, 'missing path(s)')
  return {allow, deny}
}
