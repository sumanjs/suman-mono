
const CancelSymbol = Symbol('cancel');
const RejectSymbol = Symbol('reject');

class Promise {
  
  constructor(f) {
    
    this.state = 'pending';
    this.val = null;
    this.thens = [];
    this.onRejected = null;
    this.microtaskElapsed = false;
    queueMicrotask(this.handleMicroTask.bind(this));
    
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
      
      if(this.microtaskElapsed){
        this._resolveThenables();
      }
      else{
        queueMicrotask(() => {
            this._resolveThenables();
        });
      }
      
      
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
  
      if(this.microtaskElapsed){
        this._rejectThenables();
      }
      else{
        queueMicrotask(() => {
          this._rejectThenables();
        });
      }
      
    });
  }
  
  _resolveThenables(){
    for (let v of this.thens) {
      try {
        const val = v.onResolved(this.val);
        if(!Promise.isPromise(val)){
          this._handleValue(val, v.resolve, v.reject);
        }
        else{
          val.then(
            this._handleResolveOrReject(v.resolve,v.reject)
          );
        }
      
      } catch (err) {
        v.reject(err);
      }
    }
  }
  
  _rejectThenables(){
    for (let v of this.thens) {
      try {
        const val = v.onRejected(this.val);
      
        if (!Promise.isPromise(val)) {
          this._handleValue(val,v.resolve,v.reject);
        } else {
          val.then(
            this._handleResolveOrReject(v.resolve,v.reject)
          );
        }
      
      } catch (err) {
        v.reject(err);
      }
    }
  }
  
  handleMicroTask(){
    this.microtaskElapsed = true;
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
    return {symbol: RejectSymbol, value: val};
  }
  
  static cancel(val) {
    return {symbol: CancelSymbol, value: val};
  }
  
  _handleValue(v, resolve, reject){
    
    if(v && v.symbol === CancelSymbol){
      // no further processing?
      return;
    }
  
    if(v && v.symbol === RejectSymbol){
      return reject(v.value);
    }
  
    return resolve(v);
  }
  
  _handleResolveOrReject(resolve, reject){
    return v => this._handleValue(v, resolve,reject);
  }
  
  then(onResolved, onRejected) {
    
    return new Promise((resolve, reject) => {
      
      if (this.state === 'pending') {
        return this.thens.push({onResolved, onRejected, resolve, reject});
      }
      
      if (this.state === 'resolved') {
        
        try {
          const result = onResolved(this.val);
          if (!Promise.isPromise(result)) {
            // return resolve(result);
            return this._handleValue(result,resolve,reject);
          }
          
          return result.then(
            this._handleResolveOrReject(resolve,reject)
          );
          
        } catch (err) {
          return reject(err);
        }
      }
      
      if (onRejected) {
        try {
          
          const result = onRejected(this.val);
          
          if (!Promise.isPromise(result)) {
            // return resolve(result);
            return this._handleValue(result,resolve,reject);
          }
          
          return result.then(
            this._handleResolveOrReject(resolve,reject)
          );
          
        } catch (err) {
          return reject(err);
        }
      }
      
      reject(this.val);
      
    });
  }
  
  catch(f) {
    return this.then(null, f);
  }
  
}

exports.Promise = Promise;
