'use strict'

const assert = require('assert')
const { Animal, Dog, Cat, Women, Men, Car, eraseDB } = require('./utils')

describe('MonoDB -> Inheritance', function () {
  this.timeout(5000)

  beforeEach(eraseDB)

  after(eraseDB)

  it('instanceof', async function () {
    const v1 = new Car('Fiat', '500')
    await v1.save()
    const v2 = await Car.get(v1.id)
    assert(v2)
    assert(v2 instanceof Car)
  })

  it('simple  extends', async function () {
    let alice = new Women('Alice')
    let bob = new Men('Bob')

    await alice.save()
    await bob.save()

    const bodId = bob.id
    const aliceId = alice.id

    alice = null
    bob = null

    bob = await Men.get(bodId)
    alice = await Women.get(aliceId)

    assert(bob.name === 'Bob')
    assert(bob.sex === 'M')
    assert(alice.name === 'Alice')
    assert(alice.sex === 'F')
  })

  it('polymorphism', async function () {
    const cat = new Cat('Garfield')
    const dog = new Dog('Beethoven')

    await cat.save()
    await dog.save()

    const catRetrieve = await Animal.get(cat.id)
    const dogRetrieve = await Animal.get(dog.id)

    assert(catRetrieve instanceof Animal)
    assert(dogRetrieve instanceof Animal)

    assert(catRetrieve.id === cat.id)
    assert(dogRetrieve.id === dog.id)

    assert(catRetrieve.name === 'Garfield')
    assert(dogRetrieve.name === 'Beethoven')

    assert(catRetrieve.species === 'CAT')
    assert(dogRetrieve.species === 'DOG')
  })

  it('abstract class')
})
