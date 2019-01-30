Promise.resolve(null).then(v => {
    throw 'fart';
  }, e => {
    console.error(1,e);
  })
  .then(v => {
    console.log(v);
  }, e => {
    console.error(2,e);
  });
