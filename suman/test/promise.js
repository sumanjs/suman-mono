class Promise {
  
  constructor(f) {
    
    this.state = 'pending';
    this.val = null;
    this.thens = [];
    this.onRejected = null;
    
    f(v => {
      this.state = 'resolved';
      this.val = v;
      process.nextTick(() => {
        for (let v of this.thens) {
          v.f(v.resolve, v.reject);
        }
      });
      
    }, err => {
      this.state = 'rejected';
      this.val = err;
      process.nextTick(() => {
        for (let v of this.thens) {
          v.reject(this.val);
        }
      });
    });
  }
  
  static isPromise(v) {
    return v
      && typeof v.then === 'function';
      // && typeof v.catch === 'function';
  }
  
  static resolve(val) {
    return new Promise(resolve => resolve(val));
  }
  
  static reject(val) {
    return new Promise((resolve, reject) => reject(val));
  }
  
  then(f, onRejected) {
    const p = new Promise((resolve, reject) => {
      
      if (this.state === 'pending') {
        return this.thens.push({f, resolve, reject});  // <<< pass onRejected here?
      }
      
      if (this.state === 'resolved') {
        
        try {
          const result = f(this.val);
          if (!Promise.isPromise(result)) {
            return resolve(result);
          }
          try {
            return result.then(resolve, reject);
          } catch (err) {
            return reject(err);
          }
        } catch (err) {
          return reject(err);
        }
      }
      
      if (onRejected) {
        try {
          
          const result = onRejected(this.val);
  
          if (!Promise.isPromise(result)) {
            return resolve(result);
          }
          
          try {
            return result.then(resolve, reject);
          } catch (err) {
            return reject(err);
          }
          
        } catch (err) {
          return reject(err);
        }
      }
      
      reject(this.val);
      
    });
    
    p.onRejected = onRejected;
    return p;
  }
  
  ca3tch(f) {
    const p = new Promise((resolve, reject) => {
      
      if (this.state === 'pending') {
        return this.thens.push({f, resolve, reject});
      }
      
      if (this.state === 'resolved') {
        try {
          return resolve(f(this.val));
        } catch (err) {
          return reject(err);
        }
      }
      
      if (onRejected) {
        return onRejected(this.val);
      }
      
      reject(this.val);
      
    });
    
    p.onRejected = onRejected;
    return p;
  }
  
}

const p = Promise.resolve(null).then(v => {
  throw 3;
});

const p1 = p.then(v => 3, z => {
  console.error('error:', z);
  return Promise.resolve(32);
});

const p2 = p.then(v => 4, z => {
  console.error('error:', z);
  return Promise.resolve(42);
});

p1.then(console.log.bind(null, '3?'));
p2.then(console.log.bind(null, '4?'));

// p.catch(v => {
// console.error('foo1');
// });
//
// p.catch(v => {
//   console.error('foo2');
// });


exports.Promise = Promise;
