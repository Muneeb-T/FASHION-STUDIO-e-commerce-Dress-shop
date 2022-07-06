'use strict'

const MonoDB = require('../src/MonoDB')
const assert = require('assert')
const { eraseDB, Car } = require('./utils')

describe('MonoDB -> Bad usage tests, should throw exception', function () {
  this.timeout(5000)

  beforeEach(eraseDB)

  after(eraseDB)

  it('document does not exist', async function () {
    const car = new Car('Mini', 'One D')

    try {
      await Car.get(car.id)
      assert(false)
    } catch (err) {
      assert(true)
    }
  })

  it('keyName not a field', async function () {
    class BadClass extends MonoDB {
      constructor (field) {
        super()
        this.field = field

        this.setKeyName('NotExsit')
      }
    }

    try {
      const badClass = new BadClass('example')
      badClass.delete() // To avoid standardJS lint
      assert(false)
    } catch (err) {
      assert(true)
    }
  })

  it('simple index not fields', async function () {
    class BadClass extends MonoDB {
      constructor (field) {
        super()
        this.field = field

        this.setIndex(['NotExsit', 'field'])
      }
    }

    try {
      const badClass = new BadClass('example')
      badClass.delete() // To avoid standardJS lint
      assert(false)
    } catch (err) {
      assert(true)
    }
  })
})
