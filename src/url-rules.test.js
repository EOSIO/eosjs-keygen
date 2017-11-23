/* eslint-env mocha */
const assert = require('assert')

const UrlRules = require('./url-rules')

describe('UrlRules', () => {

  const urlRules = UrlRules({
    'active': '/transfers',
    'owner': '/account_recovery',
    'active/**': ['/contracts', '/@[\\w\\.]+']
  })

  const fixtures = [
    { // 1
      url: '/transfers',
      paths: ['active'],
      allow: ['active'], deny: []
    },
    { // 2
      url: '/account_recovery',
      paths: ['owner', 'active'],
      allow: ['owner'], deny: ['active']
    },
    { // 3
      url: '/',
      paths: ['active/mypermission'],
      deny: ['active/mypermission'], allow: [],
    },
    { // 4
      url: '/@myaccount',
      paths: ['active/mypermission'],
      allow: ['active/mypermission'], deny: [],
    },
    { // 5
      url: '/contracts/mycontract',
      paths: ['active/mypermission'],
      allow: ['active/mypermission'], deny: [],
    },
    { // 6
      url: '/contracts/mycontract',
      paths: ['active/mypermission', 'active'],
      allow: ['active/mypermission'], deny: ['active'],
    },
  ]

  let fixtureIndex = 1
  for(const test of fixtures) {
    const {paths, url, allow, deny} = test

    it(`test ${fixtureIndex} urlRules.allow: ` + JSON.stringify(test), () => {
      assert.deepEqual(allow, urlRules.allow(url, paths))
    })

    it(`test ${fixtureIndex} urlRules.deny: ` + JSON.stringify(test), () => {
      assert.deepEqual(deny, urlRules.deny(url, paths))
    })

    it(`test ${fixtureIndex} urlRules.check: ` + JSON.stringify(test), () => {
      assert.deepEqual({allow, deny}, urlRules.check(url, paths))
    })

    fixtureIndex++
  }
})