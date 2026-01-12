const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

class Promise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolveds = []
    this.onRejecteds = []

    const resolve = (v) => {
      if (this.status === PENDING) {
        this.status = FULLFILLED
        this.value = v

        this.onResolveds.forEach((cb) => cb(v))
      }
    }

    const reject = (r) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = r

        this.onRejecteds.forEach((cb) => cb(r))
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onResolved, onRejected) {
    return new Promise((resolve, reject) => {
      const handleResolved = () => {
        if (typeof onResolved === 'function') {
          try {
            const result = onResolved(this.value)
            resolvePromise(result, resolve, reject)
          } catch (error) {
            reject(error)
          }
        } else {
          resolve(this.value)
        }
      }

      const handleRejected = () => {
        if (typeof onResolved === 'function') {
          try {
            const result = onRejected(this.reason)
            resolvePromise(result, resolve, reject)
          } catch (error) {
            reject(error)
          }
        } else {
          reject(this.reason)
        }
      }
      if (this.status === FULLFILLED) {
        handleResolved()
      }

      if (this.status === REJECTED) {
        handleRejected()
      }

      if (this.status === PENDING) {
        this.onResolveds.push(handleResolved)
        this.onRejecteds.push(handleRejected)
      }
    })
  }

  catch(onRejected) {
    this.then(null, onRejected)
  }
}

function resolvePromise(result, resolve, reject) {
  if (result instanceof Promise) {
    result.then(
      (v) => {
        resolve(v)
      },
      (r) => {
        reject(r)
      }
    )
  } else {
    resolve(result)
  }
}

const promise = new Promise((resolve, reject) => {
  // resolve(123)
  resolve(123)
})

const promise1 = promise.then((v) => {
  return new Promise((resolve) => {
    console.log('🚀 v', v)
    resolve(v)
  })
})

promise1.then((v) => {
  console.log('🚀 1v', v)
})
