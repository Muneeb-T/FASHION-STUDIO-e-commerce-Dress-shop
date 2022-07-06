'use strict';

class Mutex {
  static #locks = {}

  #pendings = undefined
  #isLocked = undefined

  constructor(key) {
    this.#pendings = []
    this.#isLocked = false
  }

  /**
  * Return unique instance depends of key param
  * @param  {string} key each key has his own lock, do not must null
  * @return {Mutex}
  */
  static getLock(key) {
    if (!key) {
      throw new Error('Key argument must be provided or must not be null or undefined')
    }

    if (!this.#locks[key]) {
      this.#locks[key] = new Mutex()
    }

    return this.#locks[key]
  }

  lock(fn, call) {
    if (call) {
      console.log('lock ' + call)
    }

    if (!(fn && fn instanceof Function)) {
      throw new Error('First param must be a function')
    }

    if (this.#isLocked) {
      // Add fn to queue
      this.#pendings.push(fn)
    } else {
      this.#isLocked = true
      return fn(this.unlock.bind(this))
    }
  }

  unlock(call) {
    if (call) {
      console.log('unlock ' + call)
    }

    if (this.#isLocked) {
      if (this.#pendings.length > 0) {
        let fn = this.#pendings.shift()
        return fn(this.unlock.bind(this))
      } else {
        this.#isLocked = false
      }
    } else {
      throw new Error('unlock must call only after lock')
    }
  }

  isLocked() {
    return this.#isLocked
  }
}

module.exports = Mutex
