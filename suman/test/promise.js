class Promise {
  
  constructor(f) {
    
    this.state = 'pending';
    this.val = null;
    this.thens = [];
    this.onRejected = null;
    
    f(v => {
      
      if(this.state === 'resolved'){
        throw 'Promise resolve callback fired twice.';
      }
      
      if(this.state === 'rejected'){
        throw 'Promise resolve callback fired after promise was already rejected.';
      }
      
      this.state = 'resolved';
      this.val = v;
      
      if (this.thens.length < 1) {
        return;
      }
      
      // process.nextTick(() => {
        
        for (let v of this.thens) {
          
          try {
            // v.onResolved(v.resolve, v.reject);
           const val = v.onResolved(this.val);
           if(!Promise.isPromise(val)){
              v.resolve(val);
           }
           else{
             val.then(v.resolve,v.reject);
           }

          } catch (err) {
            throw 'bing! ' + err.stack;
            // v.onRejected(v.resolve())
          }
          
        }
      // });
      
    }, err => {
  
      if(this.state === 'rejected'){
        throw 'Promise reject callback fired twice.';
      }
  
      if(this.state === 'resolved'){
        throw 'Promise reject callback fired after promise was already resolved.';
      }
      
      this.state = 'rejected';
      this.val = err;
      
      if (this.thens.length < 1) {
        return;
      }
      
      // process.nextTick(() => {
        for (let v of this.thens) {
          console.log('this gets hit');
          v.reject(this.val);
        }
      // });
    });
  }
  
  static isPromise(v) {
    return v
      && typeof v.then === 'function'
      && typeof v.catch === 'function';
  }
  
  static resolve(val) {
    return new Promise(resolve => resolve(val));
  }
  
  static reject(val) {
    return new Promise((resolve, reject) => reject(val));
  }
  
  then(onResolved, onRejected) {
    
    const p = new Promise((resolve, reject) => {
      
      if (this.state === 'pending') {
        return this.thens.push({onResolved, onRejected, resolve, reject});  // <<< pass onRejected here?
      }
      
      if (this.state === 'resolved') {
        
        try {
          const result = onResolved(this.val);
          if (!Promise.isPromise(result)) {
            return resolve(result);
          }
          
          return result.then(resolve, reject);
          
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
          
          return result.then(resolve, reject);
          
        } catch (err) {
          return reject(err);
        }
      }
      
      reject(this.val);
      
    });
    
    p.onRejected = onRejected;
    return p;
  }
  
  catch(f) {
    return this.then(null, f);
  }
  
}

exports.Promise = Promise;
