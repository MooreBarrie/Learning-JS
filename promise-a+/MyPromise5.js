const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

class MyPromise5 {
  #state = PENDING
  #result = undefined
  #handlers = []

  constructor(executor) {
    const resolve = (data) => this.#changeState(FULLFILLED, data)
    const reject = (reason) => this.#changeState(REJECTED, reason)

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  #changeState(state, result) {
    if (this.#state !== PENDING) return
    this.#state = state
    this.#result = result
    this.#runhandlers()
  }

  then(onFulfilled, onRejected) {
    return new MyPromise5((resolve, reject) => {
      this.#handlers.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      })
      this.#runhandlers()
    })
  }

  #runhandlers() {
    if (this.#state === PENDING) return
    while (this.#handlers.length > 0) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handlers.shift()
      this.#handleCallback(this.#state === FULLFILLED ? onFulfilled : onRejected, resolve, reject)
    }
  }

  #handleCallback(cb, resolve, reject) {
    this.#runMicroTask(() => {
      if (typeof cb !== 'function') {
        const settled = this.#state === FULLFILLED ? resolve : reject
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
    })
  }

  #isPromiseLike(val) {
    if (typeof val !== null && (typeof val === 'object' || typeof val === 'function')) {
      return typeof val.then === 'function'
    }
  }

  #runMicroTask(func) {
    if (typeof process === 'object' && typeof process.nextTick === 'function') {
      process.nextTick(func)
    } else if (typeof MutationObserver === 'function') {
      const ob = new MutationObserver(func)
      const textNode = document.createTextNode('1')
      ob.observe(textNode, {
        characterData: true,
      })
      textNode.data = '2'
    }
  }
}

const p = new MyPromise5((resolve, reject) => {
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
