const async = require('async');

// async.parallel([
//   async.series([
//     cb => {
//       process.nextTick(cb, null, 1);
//     },
//     cb => {
//       process.nextTick(cb, null, 2);
//     }
//   ]),
//   cb => {
//     process.nextTick(cb, null, 3);
//   }
//
// ], (err, results) => {
//   console.log({err, results});
// });


console.log(process.getuid());
console.log(process.getgid());
