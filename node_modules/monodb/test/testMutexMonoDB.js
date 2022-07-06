'use strict'

const Mutex = require('../src/Mutex')
const assert = require('assert')
const fs = require('fs')
const { eraseDB, Car } = require('./utils')

describe('MonoDB -> Isolation', function () {
  this.timeout(5000)

  beforeEach(eraseDB)

  after(eraseDB)

  it('phantom reads')

  it('non-repeatable reads')

  it('dirty reads', function (done) {
    const c1 = new Car('Ferrari', 'SF90')
    // Lock of c1 index by his code
    const mutex = Mutex.getLock(c1.code)
    let output = ''
    mutex.lock(async (unlock) => {
      // Sauvegarde blocké ! (pas de await pour ne pas que cet appel soit bloquant)
      // Avoid errors
      c1.save().then(() => {
        // Here the test is end
        output += 'B'
        assert(output === 'AB')
        done()
      }).catch(() => {
        done('Error ! Saving not working')
      })

      // Donc le fichier ne doit pas (encore) exister
      const path = '.dbTest/Car/' + c1.id + '.json'
      fs.stat(path, function (err, res) {
        if (err) {
          // OK!
          output += 'A'
          unlock()
        } else {
          done('Error ! the lock has not work')
        }
      })
    })
  })
})
