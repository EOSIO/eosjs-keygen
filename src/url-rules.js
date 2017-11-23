const assert = require('assert')
const minimatch = require("minimatch")

const validate = require('./validate')

module.exports = UrlRules

/**
  Create path and corresponding Url matching regular expressions.  If a path
  matches but the url does not, it will show up in a remove list.

  @arg {Object<minimatch, UrlPathSet>} rules

  @example UrlRules({
    'owner': '/account_recovery',
    'active': '/@[\\w\\.]+/transfers',
    'active/**': '/@[\\w\\.]'
  })
*/
function UrlRules(rules) {
  rules = Object.assign({}, rules)

  for(const path in rules) {
    const urlPatterns = rules[path]
    const rePatterns = createUrlRules(urlPatterns)
    rules[path] = rePatterns
  }

  /**
    Separate out paths into Allow and Deny.

    @arg {urlpath}

    @arg {Set<path>|Array<path>} paths - key paths: owner, active,
    active/mypermission, etc..  These paths are created from blockchain
    account.permissions and gathered in the session.login function.
  
  
    @return {{allow: Array<path>, deny: Array<path>}} - paths allowed or denied
    under current Url path.  This tells the keystore, according to the Url rules
    generate private keys only for these paths.

    @return {object} {allow, deny}
  */
  function check(url, paths) {
    return checkUrl(url, paths, rules)
  }

  /** Just allowed paths */
  function allow(url, paths) {
    return checkUrl(url, paths, rules).allow
  }

  /** Just deny paths */
  function deny(url, paths) {
    return checkUrl(url, paths, rules).deny
  }

  return {
    check,
    allow,
    deny
  }
}

function createUrlRules(urlPatterns) {
  if(typeof urlPatterns === 'string') {
    urlPatterns = [urlPatterns]
  }
  return urlPatterns.map(urlPattern => {
    if(typeof urlPattern === 'string') {
      const prefix = urlPattern.charAt(0) === '^' ? '' : '^'
      const suffix = urlPattern.charAt(urlPattern.length - 1) === '$' ? '' : '([/\?#].*)?$'
      urlPattern = new RegExp(prefix + urlPattern + suffix, 'i')
    }
    assert(urlPattern instanceof RegExp, 'urlPattern should be a string or RegExp')
    return urlPattern
  })
}

/** @private */
function checkUrl(url, paths, rules) {
  assert.equal('string', typeof url, 'url')

  assert(paths instanceof Array || paths instanceof Set,
    'paths is a Set or Array')

  for(const path of paths) {
    validate.path(path)
  }

  /**
    Get url rules (minimatch pattern) for a path (string).

    @arg {string} path

    @return {Array<UrlPathSet>} from rules[path] or <b>null</b>
  */
  function firstUrlPathSet(path) {
    for(const rulePath in rules) {
      const match = minimatch(path, rulePath)
      // console.log('firstUrlPathSet', path, rulePath, match)
      if(match) {
         return rules[rulePath]
      }
    }
    return null
  }

  const allow = [], deny = []
  for(const path of paths) {
    const urlPathSet = firstUrlPathSet(path)
    if(urlPathSet) {
      let oneMatches = false
      for(const urlPathRegExp of urlPathSet) {
        oneMatches = urlPathRegExp.test(url)
        // console.log('urlPathRegExp', urlPathRegExp, url, oneMatches)
        if(oneMatches) {
          allow.push(path)
          break
        }
      }
      if(!oneMatches) {
        deny.push(path)
      }
    } else {
      // no rules, it is allowed
      allow.push(path)
    }
  }
  assert.equal(paths.length, allow.length + deny.length, 'missing path(s)')
  return {allow, deny}
}
