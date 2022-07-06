'use strict'

const { eraseDB, SizedObject } = require('./utils')
const assert = require('assert')
const fs = require('fs')

describe('Medium Size database (~100Mo)', function () {
  this.timeout(5000)

  before(async function () {
    // Build a medium dataset, 1 classes with 10K file
    for (let i = 0; i < 10000; i++) {
      await new SizedObject(10).save()
    }
  })

  after(eraseDB)

  it('All objects are saved (10K objects, each size 10Ko)', function (done) {
    const filePath = '.database/SizedObject/'
    fs.readdir(filePath, function (err, res) {
      assert(!err)
      assert(res)
      assert(res.length === 10000)
      done()
    })
  })
})
