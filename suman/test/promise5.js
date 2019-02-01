
const {Promise} = require('./promise');

const z = Promise.resolve(null).then(v => {
    throw 'fart';
  });
  
  z
  .then(v => {
    console.log(v);
  })
  .then(v => {
    console.log(v);
  })
  .then(v => {
    console.log(v);
  })
  // .then(v => {
  //   console.log(v);
  // }, e => {
  //   console.error('zoom',4);
  // })
  .catch(e => {
    console.error('bar', 66);
  });

z
  .then(v => {
    console.log(v);
  })
  .then(v => {
    console.log(v);
  })
  .then(v => {
    console.log(v);
  })
  // .then(v => {
  //   console.log(v);
  // }, e => {
  //   console.error('zoom',4);
  // })
  .catch(e => {
    console.error('bar', 77);
    throw e;
  })
  .then(v => {
    console.error('success', 77);
  })
  .catch(e => {
    console.error('bar 2', 77);
  });
