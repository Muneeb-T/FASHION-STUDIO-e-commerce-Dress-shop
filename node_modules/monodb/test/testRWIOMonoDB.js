'use strict'

const assert = require('assert')
const fs = require('fs')
const { eraseDB, Car } = require('./utils')

describe('MonoDB -> Read/Write file in database', function () {
  this.timeout(5000)

  beforeEach(eraseDB)

  after(eraseDB)

  it('save', function (done) {
    const v1 = new Car('Fiat', '500')
    v1.save().then(() => {
      const filePath = '.database/Car/' + v1.id + '.json'
      fs.readFile(filePath, 'utf8', function (err, res) {
        if (err) {
          done(err)
        }

        const obj = JSON.parse(res)

        assert(obj._id === v1.id)
        assert(obj.brand === 'Fiat')
        assert(obj.model === '500')
        done()
      })
    })
  })

  it('get', function (done) {
    const obj = {
      _id: 'SuperId',
      brand: 'Peugeot',
      model: '205'
    }

    const str = JSON.stringify(obj)
    const path = '.database/Car/SuperId.json'
    fs.mkdir('.database/Car/', { recursive: true }, function (err) {
      if (err) {
        done(err)
      }

      fs.writeFile(path, str, 'utf8', function (err) {
        if (err) {
          done(err)
        }

        Car.get('SuperId').then(function (res) {
          if (!res) {
            done('Error')
          }

          assert(res.id === 'SuperId')
          assert(res.brand === 'Peugeot')
          assert(res.model === '205')

          done()
        })
      })
    })
  })

  it('delete', function (done) {
    const obj = {
      _id: 'CoollestId',
      brand: 'Renault',
      model: 'Picasso'
    }

    const str = JSON.stringify(obj)
    const path = '.database/Car/CoollestId.json'
    fs.mkdir('.database/Car', { recursive: true }, function (err) {
      if (err) {
        done(err)
      }

      fs.writeFile(path, str, 'utf8', function (err) {
        if (err) {
          done(err)
        }

        const car = new Car('Renault', 'Picasso')
        car._id = 'CoollestId'
        car.setMeta()
        car.delete().then(() => {
          done()
        }).catch(done)
      })
    })
  })
})
