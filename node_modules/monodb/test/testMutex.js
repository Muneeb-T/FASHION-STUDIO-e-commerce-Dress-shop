'use strict'

const Mutex = require('../src/Mutex')
const assert = require('assert')

describe('Test Mutex', function () {
  it('use constructor', function (done) {
    let output = ''

    const m = new Mutex()
    m.lock(function (unlock) {
      setTimeout(function () {
        output += 'A'
        unlock()
      }, 10)
    })

    m.lock(function (unlock) {
      setTimeout(function () {
        output += 'B'
        unlock()
      }, 5)
    })

    m.lock(function (unlock) {
      setTimeout(function () {
        output += 'C'
        unlock()

        assert(output === 'ABC')
        done()
      }, 1)
    })
  })

  it('use getLock with same key return same instance', function () {
    const m1 = Mutex.getLock('SomeKey')
    const m2 = Mutex.getLock('SomeKey')

    assert(m1 === m2)
  })

  it('use getLock with differene key return different instance', function () {
    const m1 = Mutex.getLock('SomeKey')
    const m2 = Mutex.getLock('OtherKey')

    assert(m1 !== m2)
  })
})
