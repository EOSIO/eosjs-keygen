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
      path: 'start-with',
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
      path: 'end-with$',
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
    const {path, allow, deny} = test
    console.log({[keyPath]: path});
    const uriRules = UriRules({[keyPath]: path})

    for(const rule of allow) {
      it(`Test ${fixtureIndex} Allow Uri Rules: ` + rule, () => {
        assert.deepEqual([keyPath], uriRules.allow(rule, [keyPath]))
      })
    }
    for(const rule of deny) {
      it(`Test ${fixtureIndex} Deny Uri Rules: ` + rule, () => {
        assert.deepEqual([keyPath], uriRules.deny(rule, [keyPath]))
      })
    }
    fixtureIndex++
  }
})
