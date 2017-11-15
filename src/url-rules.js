
module.exports = UrlRules

/**
  Create path and corresponding Url matching regular expressions.  If a path
  matches but the url does not, it will show up in a remove list.

  @arg {object<rePath, reSet>} rules

  @example UrlRules({
    'owner': 'account_recovery',
    'owner/active': '@[\w\.]+/transfers',
    'myaccount/[\w\.]+': '@[\w\.]'
  })
*/

function UrlRules(rules) {
  const urlRules = rules.map(
    ([path, urlPattern]) => createUrlRule(path, urlPattern)
  )

  /**
    @arg {Set} paths - key paths: owner, owner/active, myaccount/mypermission, etc..
    @arg {string} url
    @return {Array} paths that should be removed under the given Url

    @example assert.deepEqual([], check(['owner'], 'http://localhost/account_recovery')
    @example assert.deepEqual(['owner'], check(['owner'], 'http://localhost/@myaccount/..')
  */
  function check(paths, url) {
    return paths.filter(path => {
      
    })
  }

  return {
    check
  }
}


/**
  A valid regular expression string or a regular expression object.

  If a string is provided it is converted to a RegExp by inspecting and
  optionally adding common suffixes and prefixes.

  If a RegExp object is provided, it is used without modification.  

  @typedef {string|RegExp} reStr
*/

/**
  @typedef {reStr|Array<reStr>} reSet
*/

/**
  A string is converted to a full path matching string.
  @typedef {reStr} rePath

  @example path = new RegExp('^' + path + '$')
*/

/**
  If a string is provided the following concatenation occurs:
  * If it does not sart with ^, root with http or https then any domain
  * Add your regexp
  * If it does not end with $, allow any valid Url suffix
  @typedef {reStr} reSet

  @example {
    const prefix = re.charAt(0) === '^' ? '' : '^https?://[^/]+/'
    const suffix = re.charAt(re.length - 1) === '$' ? '' : '([/\?#].*)?$'
    return new RegExp(prefix + re + suffix, 'i')
  }
*/


/**
  @return {[RegExp, [RegExp]]} - [path, [urlMatchers]]
*/
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
      const prefix = re.charAt(0) === '^' ? '' : '^https?://[^/]+/'
      const suffix = re.charAt(re.length - 1) === '$' ? '' : '([/\?#].*)?$'
      re = new RegExp(prefix + re + suffix, 'i')
    }
    assert(re instanceof RegExp, 'path should be a string or RegExp')
    return re
  })
  return [path, reArray]
}