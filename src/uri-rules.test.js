/* eslint-env mocha */
const assert = require('assert')

const UriRules = require('./uri-rules')

describe('Path Rules', () => {

  const uriRules = UriRules({
    'owner' : '/account_recovery',
    'active': '/(transfers|contracts)',
    'active/**': '/contract'
  })

  const fixtures = [
    {// 1
      uri: '/account_recovery',
      paths: ['owner', 'active', 'active/mypermission'],
      allow: ['owner', 'active', 'active/mypermission'], deny: []
    },
    {// 2
      uri: '/transfers',
      paths: ['active', 'active/mypermission', 'owner'],
      allow: ['active', 'active/mypermission'], deny: ['owner']
    },
    {// 3
      uri: '/contract',
      paths: ['active', 'active/mypermission', 'owner'],
      allow: ['active/mypermission'], deny: ['active', 'owner']
    },
    {// 4
      uri: '/',
      paths: ['active', 'active/mypermission', 'owner'],
      allow: [], deny: ['active', 'active/mypermission', 'owner'],
    }
  ]

  let fixtureIndex = 1
  for(const test of fixtures) {
    const {paths, uri, allow, deny} = test

    it(`Test ${fixtureIndex} Path Rules: ` + JSON.stringify(test), () => {
      assert.deepEqual(uriRules.check(uri, paths), {allow, deny})
      assert.deepEqual(uriRules.allow(uri, paths), allow)
      assert.deepEqual(uriRules.deny(uri, paths), deny)
    })
    fixtureIndex++
  }
})

describe('Uri Rules', () => {
  const fixtures = [
    {
      rule: 'start-with',
      allow: [
        'start-with', 'start-with/',
        'start-with#hp1', 'start-with?qp1',
        'start-with/#hp1', 'start-with/?qp1'
      ],
      deny: [
        'start-with-not', 'not-start-with',
        '/start-with', 'not/start-with'
      ]
    },
    {
      rule: 'end-with$',
      allow: ['end-with'],
      deny: [
        'not-end-with',
        '/end-with', 'end-with/', 'mypath/end-with', 
        'end-with?', 'end-with?qp', 'end-with#hp=1'
      ]
    },
  ]

  const keyPath = 'active/other'

  let fixtureIndex = 1
  for(const test of fixtures) {
    const {rule, allow, deny} = test
    const uriRules = UriRules({[keyPath]: rule})

    for(const path of allow) {
      it(`Test ${fixtureIndex} Uri rule '${rule}' allows '${path}'`, () => {
        assert.deepEqual([keyPath], uriRules.allow(path, [keyPath]))
      })
    }
    for(const path of deny) {
      it(`Test ${fixtureIndex} Uri rule '${rule}' denies '${path}'`, () => {
        assert.deepEqual([keyPath], uriRules.deny(path, [keyPath]))
      })
    }
    fixtureIndex++
  }
})
