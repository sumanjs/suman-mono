

const {Promise} = require('./promise');

new Promise((resolve,reject) => {
   reject('barf');
})
.then(v => {
  console.log({resolved:v});
}, e => {
  console.error({rejected:e});
});
