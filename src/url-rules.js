const assert = require('assert')

module.exports = UrlRules

/**
  Create path and corresponding Url matching regular expressions.  If a path
  matches but the url does not, it will show up in a remove list.

  @arg {Object<minimatch, UrlPathSet>} rules

  @example UrlRules({
    'owner': '/account_recovery',
    'owner/active': '/@[\w\.]+/transfers',
    'active/**': '/@[\w\.]'
  })
*/
function UrlRules(rules) {
  for(const path in rules) {
    const urlPattern = rules[path]
    createUrlRule(path, urlPattern)
  }

  /**
    @arg {Set<path>|Array<path>} paths - key paths: owner, owner/active,
    active/mypermission, etc..
  
    @arg {string} url
  
    @return {Array} paths that should be kept under the given Url

    @example assert.deepEqual([], check(['owner'], '/account_recovery')
    @example assert.deepEqual(['owner'], check(['owner'], '/@myaccount/..')
  */
  function check(paths, url) {
    assert(paths instanceof Array || paths instanceof Set, 'paths is a Set or Array')

    const allowedPaths = []
    for(const path of paths) {
      console.log('path', path)
      
    }
  }

  return {
    check
  }
}

function createUrlRule(path, urlPattern) {
  if(typeof path === 'string') {
    validate.path(path)
    path = new RegExp('^' + path + '$')
  }
  assert(path instanceof RegExp, 'path should be a string or RegExp')

  if(typeof urlPattern === 'string') {
    urlPattern = [urlPattern]
  }
  const reArray = urlPattern.map(re => {
    if(typeof re === 'string') {
      const prefix = re.charAt(0) === '^' ? '' : '^/'
      const suffix = re.charAt(re.length - 1) === '$' ? '' : '([/\?#].*)?$'
      re = new RegExp(prefix + re + suffix, 'i')
    }
    assert(re instanceof RegExp, 'path should be a string or RegExp')
    return re
  })
  return [path, reArray]
}