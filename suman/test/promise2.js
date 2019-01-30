

// const p = Promise.resolve(null);
//
// const p1 = p.then(v => 3);
//
// const p2 = p.then(v => 4);
//
//
// p1.then(console.log.bind(null,'3?'));
// p2.then(console.log.bind(null,'4?'));

const p = Promise.resolve(null).then(v => {
  throw 3;
});

const p1 = p.then(v => 3, z => {
  console.error('error:',z);
});

const p2 = p.then(v => 4, z => {
  console.error('error:',z);
});


p1.then(console.log.bind(null,'3?'));
p2.then(console.log.bind(null,'4?'));
