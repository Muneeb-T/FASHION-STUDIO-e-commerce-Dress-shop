'use strict'

const MonoDB = require('../src/MonoDB')
const assert = require('assert')
const { eraseDB, Car, User } = require('./utils')

describe('MonoDB -> Features tests', function () {
  this.timeout(5000)

  beforeEach(eraseDB)

  after(eraseDB)

  it('trivial test', async function () {
    let v1 = new Car('Fiat', '500')
    const v1Id = v1.id
    await v1.save()

    v1 = null

    const v2 = await Car.get(v1Id)
    assert(v2.id === v1Id)
    assert(v2.brand === 'Fiat')
    assert(v2.model === '500')
  })

  it('dynamic field', async function () {
    let v1 = new Car('Fiat', '500')
    const v1Id = v1.id
    v1.setKm(22)
    await v1.save()
    v1 = null

    const v2 = await Car.get(v1Id)

    assert(v2.id === v1Id)
    assert(v2.brand === 'Fiat')
    assert(v2.model === '500')
    assert(v2.km === 22)
  })

  it('equals', async function () {
    const v1 = new Car('Fiat', '500')
    await v1.save()
    const v2 = await Car.get(v1.id)

    assert(v2)
    assert(v1.equals(v1))
    assert(v1.equals(v2))
    assert(v2.equals(v1))
  })

  it('delete document', async function () {
    const v1 = new Car('Fiat', '500')
    await v1.save()
    const v1Id = v1.id

    await v1.delete()

    const retrieve = await Car.get(v1Id)
    assert(retrieve === null)
  })

  it('meta value are not visible (__fields)', async function () {
    let v1 = new Car('Fiat', '500')
    await v1.save()
    const v1Id = v1.id
    v1 = null
    const v2 = await Car.get(v1Id)

    assert(!v2.__name)
    assert(!v2.__colDir)
    assert(!v2.__filePath)
    assert(!v2.__keyName)
    assert(!v2.__index)
    assert(!v2.__mutex)
  })

  it('promise feature', function (done) {
    const v1 = new Car('Fiat', '500')
    v1.save().then(function () {
      assert(true)
      done()
    }).catch(function () {
      assert(false)
    })
  })

  it('change key attribute', async function () {
    const u1 = new User('Hagatopaxi')
    try {
      await u1.save()
    } catch (err) {
      assert(false)
    }

    assert(u1.id === 'Hagatopaxi')
  })

  it('object reduce size', async function () {
    class Exemple extends MonoDB {
      constructor () {
        super()
        this.arr = 'Very loooooooooooonnng string'
      }
    }

    const ex = new Exemple()
    await ex.save()

    ex.arr = 'shorter string'

    await ex.save()

    const retrieve = await Exemple.get(ex.id)
    assert(retrieve)
  })

  it('delete collection')
  it('delete database')
})
