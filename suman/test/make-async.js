'use strict';

const suman = require('suman');
const {Test} = suman.init(module);


Test.create(b => {
  
  const {before, it} = b.getHooks();
  
  it("does", t => {
    
    const v = t.makeAsync();
    setTimeout(v.done, 40);
    
  });
  
  
});
