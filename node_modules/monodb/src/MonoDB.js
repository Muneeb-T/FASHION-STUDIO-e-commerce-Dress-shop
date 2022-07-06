'use strict'

const fs = require('fs').promises
const fsCb = require('fs')
const { exec } = require('child_process')
const path = require('path')
const Mutex = require('./Mutex')

class MonoDB {
  #__colDir = undefined
  #__filePath = undefined
  #__name = undefined
  #__keyName = undefined
  #__index = undefined
  #__mutex = undefined
  #__parent = undefined

  static __dbPath = "./.database"

  constructor() {
    if (!this) {
      throw new Error("Call constructor with new")
    }

    this._id = this._id || this.getId()
    this._creationDate = this._creationDate || new Date()
    this._lastUpdateDate = new Date()

    this.setMeta()
  }

  setMeta() {
    /*** Meta properties ***/
    this.#__name = this.constructor.name
    this.#__colDir = path.join(MonoDB.dbPath, this.#__name)
    this.#__filePath = path.join(this.#__colDir, this._id + '.json')
    this.#__mutex = Mutex.getLock(this.code)
  }

  async save(call) {
    return new Promise(async (resolve, reject) => {
      this.#__mutex.lock(async (unlock) => {

        try {
          await fs.stat(this.#__colDir)
        } catch (err) {
          await fs.mkdir(this.#__colDir, { recursive: true })
        }

        this._lastUpdateDate = new Date()
        let obj = this
        let str = JSON.stringify(obj)

        fsCb.writeFile(this.#__filePath, str, { encoding: "utf8", flag: "w" }, (err, res) => {
          if (err) {
            unlock()
            reject(new Error("SaveError: " + this.code + " can't be saved"))
            return
          }

          this.saveIndex().then(() => {
            if (this.#__parent) {

              let parentDir = this.#__colDir.replace(this.#__name, this.#__parent)
              let parentPath = this.#__filePath.replace(this.#__name, this.#__parent)

              let cmd = `ln -f ${this.#__filePath} ${parentPath}`

              fsCb.mkdir(parentDir, { recursive: true }, (err, res) => {
                exec(cmd, () => {
                  unlock()
                  resolve()
                })
              })
            } else {
              unlock()
              resolve()
            }
          })
        })
      })
    })
  }

  async delete() {
    return new Promise(async (resolve, reject) => {
      this.#__mutex.lock(async (unlock) => {
        try {
          await fs.unlink(this.#__filePath)
        } catch (err) {
          unlock()
          reject(new Error("Document must be saved before to be deleted: " + this.code))
        }
        await this.deleteIndex()
        unlock()
        resolve()
      })
    })
  }

  /**
   * Satic function to retrieve object already store
   * @param  {string}  id the id of object
   * @return {Promise}    object retrieve with correct prototype
   */
  static async get(id) {
    let code = this.name + "@" + id
    let mutex = Mutex.getLock(code)

    return new Promise(async (resolve, reject) => {
      mutex.lock(async (unlock) => {
        let colDir = path.join(MonoDB.dbPath, this.name)
        let filePath = path.join(colDir, id + '.json')
        let res = {}

        try {
          let content = await fs.readFile(filePath, 'utf8')
          res = JSON.parse(content)
        } catch (err) {
          unlock()
          resolve(null)
          return
        }

        res = Object.assign(new this, res)
        res.setMeta()

        unlock()
        resolve(res)
      })
    })
  }

  /**** Index ****/

  setIndex(index) {
    if (!Array.isArray(index)) {
      index = [index]
    }
    // Check if all index exist and are defined
    for (let i of index) {
      if (!(i in this)) {
        throw new Error("All index name must be fields")
      }
    }

    this.#__index = index
  }

  async saveIndex() {
    return new Promise((resolve, reject) => {
      if (this.#__index) {
        let stack = []
        for (let index of this.#__index) {

          let fn = new Promise((resolve, reject) => {
            let indexDir = path.join(this.#__colDir, index, this[index].toString())
            fsCb.mkdir(indexDir, { recursive: true }, (err) => {
              if (err) {
                reject(err)
                return
              }

              let indexFile = path.join(indexDir, this.id + '.json')

              let cmd = `ln -f ${this.#__filePath} ${indexFile}`
              exec(cmd, (err) => {
                if (err) {
                  reject(err)
                  return
                }
                resolve()
              })
            })
          })

          stack.push(fn)
        }

        Promise.all(stack).then(resolve).catch(reject)
      } else {
        resolve()
      }
    })
  }

  static async getByIndex(indexName, value) {
    let colDir = path.join(MonoDB.dbPath, this.name)
    let indexDir = path.join(colDir, indexName, value)
    let res = []
    let files = []

    try {
      files = await fs.readdir(indexDir)
    } catch (err) {
      return res
    }

    for (let fileName of files) {
      let filePath = path.join(colDir, fileName)

      try {
        let obj = JSON.parse(await fs.readFile(filePath, 'utf8'))
        obj = Object.assign(new this, obj)
        obj.setMeta()
        res.push(obj)
      } catch (err) { }
    }

    return res
  }

  async deleteIndex() {
    for (let indexName of this.#__index || []) {
      let indexPath = path.join(this.#__colDir, indexName, this[indexName].toString(), this.id + '.json')
      try {
        await fs.unlink(indexPath)
      } catch (err) {
        throw new Error("Index must be exist to be deleted: " + this.code)
      }
    }
  }

  get __meta() {
    return {
      colDir: this.#__colDir,
      filePath: this.#__filePath,
      name: this.#__name,
      keyName: this.#__keyName,
      index: this.#__index,
      mutex: this.#__mutex,
      dbPath: this.constructor.__dbPath
    }
  }

  static get dbPath() {
    return this.__dbPath || "./.database"
  }

  static set dbPath(path) {
    this.__dbPath = path
  }

  get id() {
    return this._id
  }

  set id(nope) {
    throw new Error("You can not modify `id` field, use `_id` to not throw an error")
  }

  get creationDate() {
    return this._creationDate
  }

  set creationDate(nope) {
    throw new Error("You can not modify `creationDate` field, use `_creationDate` to not throw an error")
  }

  get lastUpdateDate() {
    return this._lastUpdateDate
  }

  static async deleteDB() {
    throw new Error("Unavailable function")
  }

  get code() {
    return this.#__name + "@" + this._id
  }

  set code(nope) {
    throw new Error("Modification du code en cours")
  }

  equals(other) {
    return this.#__name === other.#__name && this.id === other.id
  }

  getId() {
    return `${Math.random().toString(16).substring(3, 7)}-${Math.random().toString(16).substring(3, 7)}-${Math.random().toString(16).substring(3, 7)}-${Math.random().toString(16).substring(3, 7)}`
  }

  setKeyName(keyName) {
    if (keyName in this) {
      this.#__keyName = keyName
      this._id = this[this.#__keyName]
      this.#__filePath = path.join(this.#__colDir, this._id + '.json')
    } else {
      throw new Error("Key name must be an existing field")
    }
  }

  setParent(parent) {
    this.#__parent = parent.name
  }

  getFilePath() {
    return this.#__filePath
  }
}

module.exports = MonoDB
