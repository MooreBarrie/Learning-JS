const PENDING = 'pending'
const FULLFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  #state = PENDING
  #data = undefined
  #handlers = []

  constructor(executor) {
    const resolve = (value) => {
      this.#changeState(FULLFILLED, value)
    }
    const reject = (reason) => {
      this.#changeState(REJECTED, reason)
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  #changeState(state, data) {
    if (this.#state !== PENDING) return
    this.#state = state
    this.#data = data
    this.#runHandlers()
  }

  #runHandlers() {
    if (this.#state === PENDING) return
    while (this.#handlers.length) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handlers.shift()

      this.#runMicrotask(() => {
        this.#handleCb(this.#state === FULLFILLED ? onFulfilled : onRejected, resolve, reject)
      })
    }
  }

  #handleCb(cb, resolve, reject) {
    if (typeof cb !== 'function') {
      const settled = this.#state === FULLFILLED ? resolve : reject
      settled(this.#data)
      return
    }

    try {
      const result = cb(this.#data)
      if (this.#isPromiseLike(result)) {
        result.then(resolve, reject)
      } else {
        resolve(result)
      }
    } catch (error) {
      reject(error)
    }
  }

  #isPromiseLike(obj) {
    if (obj !== null && (typeof obj === 'object' || typeof obj === 'function')) {
      return typeof obj.then === 'function'
    }
    return false
  }

  #runMicrotask(fn) {
    if (process !== null && typeof process === 'object' && typeof process.nextTick === 'function') {
      process.nextTick(fn)
    } else if (typeof MutationObserver === 'function') {
      const ob = new MutationObserver(fn)
      const node = document.createTextNode('1')
      ob.observe(node, { characterData: true })
      node.data = '2'
    } else {
      setTimeout(fn, 0)
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.#handlers.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      })
      this.#runHandlers()
    })
  }
}

const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(2324)
  }, 1000)
})
p.then(
  (res) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🚀 res1', res)
        resolve(res * 2)
      }, 2000)
    })
  },
  (err) => {
    console.log('🚀 err1', err)
  }
).then((res) => {
  console.log('🚀 res2', res)
})
