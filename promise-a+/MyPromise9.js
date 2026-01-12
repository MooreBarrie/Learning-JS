const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  #state = PENDING
  #result = undefined
  #handlers = []

  constructor(exexcutor) {
    const resolve = (value) => {
      this.#changeState(FULFILLED, value)
    }
    const reject = (reason) => {
      this.#changeState(REJECTED, reason)
    }
    try {
      exexcutor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  #changeState(state, result) {
    if (this.#state !== PENDING) return

    this.#state = state
    this.#result = result
    this.#runHandlers()
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

  #runHandlers() {
    if (this.#state === PENDING) return

    while (this.#handlers.length) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handlers.shift()
      this.#runMicroTask(() => {
        this.#handleCb(this.#state === FULFILLED ? onFulfilled : onRejected, resolve, reject)
      })
    }
  }

  #handleCb(cb, resolve, reject) {
    if (typeof cb !== 'function') {
      const settled = this.#state === FULFILLED ? resolve : reject
      settled(this.#result)
      return
    }

    try {
      const data = cb(this.#result)
      if (this.#isPromiseLike(data)) {
        data.then(resolve, reject)
      } else {
        resolve(data)
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

  #runMicroTask(fn) {
    if (process !== null && typeof process === 'object' && typeof process.nextTick === 'function') {
      process.nextTick(fn)
    } else if (typeof MutationObserver === 'function') {
      const ob = new MutationObserver(fn)
      const textNode = document.createTextNode('1')
      ob.observe(textNode, { characterData: true })
      textNode.data = '2'
    } else {
      setTimeout(fn, 0)
    }
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
