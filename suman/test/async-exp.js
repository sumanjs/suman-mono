const async = require('async');

// const {Queue} = require('async');

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


// console.log(process.getuid());
// console.log(process.getgid());

// let timeout = 55;
//
// const v = [];
//
// v.push(5,4,5,5,6,7,2,5,4,3,3,5,4,4);
//
// console.log(v);
//
// async.concatLimit([1,2,3], 4,(v,cb) => {
//
//   timeout = timeout - 10;
//   console.log(timeout);
//
//   console.log('foo');
//   setTimeout(() => {
//     console.log('bar');
//     cb(null, [v]);
//   }, timeout)
//
//
// }, (err, results) => {
//
//   console.log({err,results});
// });


// class Foo{
//   constructor(){
//     return "bar";
//   }
// }

function Foo() {
  // return "bar"
}

const s = new Foo();
console.log(s);

return;

const q = async.queue((task,cb) => {
  task(cb);
  // process.nextTick(() => {
  //   task(cb)
  // });
},1);

q.saturated = function(){
 console.log('saturated');
};

q.unsaturated = function(){
  console.log('unsaturated');
};


q.drain = function(){
  console.log('drained.');
};


q.push(cb => {
  console.log('called 1.');
  cb(null);
});

q.push(cb => {
  console.log('called 2.');
  cb(null);
});

q.push(cb => {
  console.log('called 3.');
  cb(null);
});
//
// q.push(cb => {
//   console.log('called 3.');
//   cb(null);
// });

