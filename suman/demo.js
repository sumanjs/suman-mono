const _ = require('lodash');
const assert = require('assert');

const putInBuckets = function (min, list) {
  
  if (list.length <= min) {
    return [list];
  }
  
  const sortedRandomly = _.shuffle(list);
  console.log(sortedRandomly); // here is logging the shuffle
  const ret = [];
  const len = list.length;
  const numberOfBuckets = Math.floor(len / min);
  
  let i = 0;
  
  for (let v of sortedRandomly) {
    
    const whichBucket = i++ % numberOfBuckets;
    
    if (!ret[whichBucket]) {
      ret[whichBucket] = [];
    }
    
    ret[whichBucket].push(v);
  }
  
  return ret;
  
};





console.log(
  putInBuckets(4, ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"])
);

const testBuckets = function (originalList, min, list) {
  
  if (originalList.length <= min) {
    assert.deepStrictEqual(originalList, [originalList], 'Should be simple result.')
  }
  
  for (let v of list) {
    
    assert(Array.isArray(v), 'This element should be an array.');
    assert(v.length >= min, 'Array element has too few items in it.');
    
  }
  
};
