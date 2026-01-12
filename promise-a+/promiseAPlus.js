const PENDING = 'pending'
const REJECTED = 'rejected'
const FULLFILLED = 'fullfilled'

class MyPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFullfilleds = []
    this.onRejecteds = []

    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULLFILLED
        this.value = value
        this.onFullfilleds.forEach((cb) => cb(this.value))
      }
    }

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejecteds.forEach((cb) => cb(this.reason))
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFullfilled, onRejected) {
    const newPromise = new MyPromise((resolve, reject) => {
      const fullfilledHandler = (value) => {
        try {
          if (typeof onFullfilled === 'function') {
            const result = onFullfilled(value)
            resolve(result)
          } else {
            resolve(value)
          }
        } catch (error) {
          reject(error)
        }
      }

      const rejectedHandler = (reason) => {
        try {
          if (typeof onRejected === 'function') {
            const result = onRejected(reason)
            resolve(result)
          } else {
            reject(reason)
          }
        } catch (error) {
          reject(error)
        }
      }

      if (this.status === FULLFILLED) {
        setTimeout(() => {
          fullfilledHandler(this.value)
        })
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          rejectedHandler(this.reason)
        })
      } else if (this.status === PENDING) {
        this.onFullfilleds.push(fullfilledHandler)
        this.onRejecteds.push(rejectedHandler)
      }
    })

    return newPromise
  }

  catch(onRejected) {
    this.then(null, onRejected)
  }
}

const promise = new MyPromise((resolve, reject) => {
  // resolve(123)
  resolve(123)
})

const promise1 = promise.then((v) => {
  return new MyPromise((resolve) => {
    console.log('🚀 v', v)
    resolve(v)
  })
})

promise1.then((v) => {
  console.log('🚀 1v', v)
})
