'use strict'

const assert = require('assert')
const { eraseDB, Food, Student } = require('./utils')

describe('MonoDB -> Index', function () {
  this.timeout(5000)

  beforeEach(eraseDB)

  after(eraseDB)

  it('simple index feature', async function () {
    const f1 = new Food('Bread', 'France')
    const f2 = new Food('Wine', 'France')
    const f3 = new Food('Tea', 'England')

    assert(f1.id)
    assert(f2.id)
    assert(f3.id)

    await f1.save()
    await f2.save()
    await f3.save()

    const foods = await Food.getByIndex('origin', 'France')

    assert(foods.length === 2)
    assert(foods[0] instanceof Food)
    assert(foods[1] instanceof Food)

    // Order in index return are not conserve
    assert((foods[0].equals(f1) && foods[1].equals(f2)) || (foods[0].equals(f2) && foods[1].equals(f1)))
  })

  it('multiple index feature', async function () {
    const s1 = new Student('math', 1, 'Paris')
    const s2 = new Student('math', 1, 'Grenoble')
    const s3 = new Student('math', 2, 'Paris')
    const s4 = new Student('physic', 2, 'Grenoble')
    const s5 = new Student('physic', 3, 'Paris')
    const s6 = new Student('physic', 3, 'Grenoble')

    await Promise.all([s1.save(), s2.save(), s3.save(), s4.save(), s5.save(), s6.save()])

    const schools = await Student.getByIndex('school', 'Paris')
    assert(schools.length === 3)
    assert(schools[0].school === 'Paris')
    assert(schools[1].school === 'Paris')
    assert(schools[2].school === 'Paris')

    const levels = await Student.getByIndex('level', '1')
    assert(levels.length === 2)
    assert(levels[0].level === 1)
    assert(levels[1].level === 1)

    const classrooms = await Student.getByIndex('classroom', 'physic')
    assert(classrooms.length === 3)
    assert(classrooms[0].classroom === 'physic')
    assert(classrooms[1].classroom === 'physic')
    assert(classrooms[2].classroom === 'physic')
  })

  it('delete index after delete document', async function () {
    const s1 = new Student('chemestry', 1, 'Paris')
    const s2 = new Student('chemestry', 1, 'Grenoble')

    await s1.save()
    await s2.save()

    let students = await Student.getByIndex('classroom', 'chemestry')

    assert(students.length === 2)
    assert(students[0].school === 'Paris' || students[0].school === 'Grenoble')
    assert(students[1].school === 'Grenoble' || students[1].school === 'Paris')

    await s1.delete()

    students = await Student.getByIndex('classroom', 'chemestry')
    assert(students.length === 1)
    assert(students[0].school === 'Grenoble')
  })
})
