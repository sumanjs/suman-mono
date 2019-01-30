

const {Promise} = require('./promise');

const p = new Promise((resolve,reject) => {
  setTimeout(() => {
    resolve('barf');
  },5);
});

// .then(v => {
//   console.log({resolved:v});
// }, e => {
//   console.error({rejected:e});
// });


const p1 = p.then(v => Promise.resolve(3), z => {
  console.error('error:', z);
  return Promise.resolve(32);
});

const p2 = p.then(v => Promise.resolve(4), z => {
  console.error('error:', z);
  return Promise.resolve(42);
});

p1.then(console.log.bind(null, '3?'));
p2.then(console.log.bind(null, '4?'));
