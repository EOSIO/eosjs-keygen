/* eslint-env mocha */
const assert = require('assert')

const UrlRules = require('./url-rules')

describe('UrlRules', () => {

  it('check', () => {
    const {check} = UrlRules({
      'owner': 'account_recovery',
      'active/**': '@[\w\.]'
    })

    const fixtures = [
      {paths: ['owner'], url: 'account_recovery', answer: ['owner']},
      {paths: ['owner'], url: 'transfers', answer: []},
      {paths: ['active/mypermission'], url: '@myaccount', answer: ['active/mypermission']},
      {paths: ['active/mypermission'], url: '/', answer: []}
    ]

    for(const test of fixtures) {
      const {paths, url, answer} = test
      // assert.deepEqual(answer, check(paths, url), JSON.stringify(test))
    }
  })
})