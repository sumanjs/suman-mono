


const async = require('async');


async.times(3, (n,cb) => {
  
  cb(null,5)
  
}, (err,results) => {

  console.log({err,results});

});
