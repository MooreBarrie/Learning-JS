const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

class MyPromise {
  #state = 'pending'
  #result = undefined
  #handlers = []

  constructor(executor) {
    const resolve = (data) => {
      this.#changeState(FULLFILLED, data)
    }
    const reject = (reason) => {
      this.#changeState(REJECTED, reason)
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  #changeState(state, result) {
    if (this.#state === PENDING) {
      this.#state = state
      this.#result = result
      this.#run()
    }
  }

  #run() {
    if (this.#state === PENDING) return
    while (this.#handlers.length) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handlers.shift()
      if (this.#state === FULLFILLED) {
        this.#runOne(onFulfilled, resolve, reject)
      } else {
        this.#runOne(onRejected, resolve, reject)
      }
    }
  }

  #runOne(cb, resolve, reject) {
    this.#runMicroTask(() => {
      if (typeof cb !== 'function') {
        const settled = this.#state === FULLFILLED ? resolve : reject
        settled(this.#result)
      } else {
        try {
          const data = cb(this.#result)
          if (this.#isPromiseLike(data)) {
            data.then(resolve, reject)
          } else {
            resolve(data)
          }
        } catch (err) {
          reject(err)
        }
      }
    })
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.#handlers.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      })
      this.#run()
    })
  }

  #isPromiseLike(val) {
    if (typeof val === 'object' && val !== null) {
      return typeof val.then === 'function'
    }
  }

  #runMicroTask(func) {
    if (typeof process === 'object' && typeof process.nextTick === 'function') {
      process.nextTick(func)
    } else if (typeof MutationObserver === 'function') {
      const ob = new MutationObserver(func)
      const textNode = document.createTextNode('1')
      ob.observe(textNode, { characterData: true })
      textNode.data = '2'
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
