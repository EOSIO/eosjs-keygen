const assert = require('assert')
const minimatch = require("minimatch")

module.exports = UrlRules

/**
  Create path and corresponding Url matching regular expressions.  If a path
  matches but the url does not, it will show up in a remove list.

  @arg {Object<minimatch, UrlPathSet>} rules

  @example UrlRules({
    'owner': 'account_recovery',
    'owner/active': '@[\w\.]+/transfers',
    'active/**': '@[\w\.]'
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
    @arg {Set<path>|Array<path>} paths - key paths: owner, owner/active,
    active/mypermission, etc..
  
    @arg {urlpath}
  
    @return {Array<path>} private key paths allowed under current Url path

    @example assert.equals(0 === check(['owner'], 'transfers').length,
      'owner is only allowed in account_recovery')

    @example assert.deepEqual(
      ['active/mypermission'], check(['active/mypermission'], '@myaccount'),
      'custom permissions should be allowed in user pages'
    )
  */
  function check(paths, url) {
    assert(paths instanceof Array || paths instanceof Set,
      'paths is a Set or Array')

    function filtersForPath(path) {
      for(const path in rules) {
        const urlPatterns = rules[path]
        
      }
    }
    const allowedPaths = []
    for(const path of paths) {
      const reFilters = filtersForPath(path)



      const rePatterns = rules[path]
      if(rePatterns) {
        let oneMatches
        for(const rePattern of rePatterns) {
          oneMatches = minimatch(path, urlPattern)
          if(oneMatches) {
            break
          }
        }
        if(oneMatches) {
          allowedPaths.push(path)
        }
      } else {
        allowedPaths.push(path)
      }
      return allowedPaths
    }
  }

  return {
    check
  }
}

function createUrlRules(urlPatterns) {
  if(typeof urlPatterns === 'string') {
    urlPatterns = [urlPatterns]
  }
  return urlPatterns.map(urlPattern => {
    if(typeof urlPattern === 'string') {
      const prefix = urlPattern.charAt(0) === '^' ? '' : '^/'
      const suffix = urlPattern.charAt(urlPattern.length - 1) === '$' ? '' : '([/\?#].*)?$'
      urlPattern = new RegExp(prefix + urlPattern + suffix, 'i')
    }
    assert(urlPattern instanceof RegExp, 'urlPattern should be a string or RegExp')
    return urlPattern
  })
}