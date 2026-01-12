const PENDING = 'PENDING'
const FULLFILED = 'FULLFILED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFullfilleds = []
    this.onRejecteds = []
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULLFILED
        this.value = value
        this.onFullfilleds.forEach((fn) => fn(value))
      }
    }

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejecteds.forEach((fn) => fn(reason))
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFullfilled, onRejected) {
    if (this.status === PENDING) {
      this.onFullfilleds.push(onFullfilled)
      this.onRejecteds.push(onRejected)
    }
    if (this.status === FULLFILED) {
      const propmise1 = new MyPromise((resolve, reject) => {
        resolvePromise()
      })

      onFullfilled(this.value)
    }
    if (this.status === REJECTED) {
      onRejected(this.reason)
    }
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) throw TypeError('循环引用')
  if (x instanceof MyPromise) {
    if (x.status === FULLFILED) resolve(x)
    if (x.status === FULLFILED) reject(x)
  } else if (x && (typeof x === 'object' || typeof x === 'function')) {
    promise1.then = x.then
  }
}

const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(123)
  }, 1000)
})

promise.then(
  (res) => {
    console.log('🚀 resolve', res)
  },
  (reson) => {
    console.log('🚀 reject', reson)
  }
)
