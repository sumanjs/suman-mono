
import http = require('http');
import fs = require('fs');
import util = require('util');

let Server = require('socket.io');
let io = new Server(3999);
let {Transform} = require('stream');

let Parser = require('tap-parser');

////////////////////////////////////////////////////

io.on('connection', function (socket) {

  console.log(' => new connection made.');

  let liner = new Transform({
    objectMode: false,

    transform: function (chunk, encoding, done) {
      console.log('pushing chunk => ', String(chunk));
      this.push(String(chunk));
      done()
    },

    flush: function (done) {
      process.nextTick(done);
    }
  });

  // let p = parser({}, function (results) {
  //   console.log(' => Parser results => ', results);
  // });

  let p = new Parser();

  p.on('complete', function (data) {
    console.log('parser complete => ', data);
  });

  p.on('assert', function (testpoint) {

    if (testpoint.skip) {
      console.log('test skip');
    }
    else if (testpoint.todo) {
      console.log('test todo/stubbed.');
    }
    else if (testpoint.ok) {
      console.log('test pass');
    }
    else {
      console.log('test fail');
    }
  });

  socket.on('tap-output', function (m) {
    console.log('message => ', m);
    liner.write(String(m) + '\n');
  });

  socket.once('tap-output-end', function(){
     // liner.end();
  });

  liner.pipe(p);

});



