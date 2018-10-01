#!/usr/bin/env node
'use strict';

import suman, {s} from 'suman';
const {Test} = suman.init(module);

///////////////////////////////////////////////////////////////////////

Test.create(function (b, assert, describe, before, beforeEach, after, afterEach, it: s.ItFn) {
  
  it('sync test', t => {
    t.assert(true);
  });
  
  it('async test', t => {
    return Promise.resolve('foo');
  });
  
  it.cb('async callback test', t => {
    
    // call t.done, t.fail, t.fatal when you're done
    // t itself is a function! with the same signature as t.done.
    t.done();
    
  });
  
});
