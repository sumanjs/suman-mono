


const suman = require('suman');
const Test = suman.init(module, {
  pre: ['smartconnect'],
  post: ['judas']
});



[1,2,3,4,5,6,7,8,9].forEach(function(item){

  Test.describe('testsuite#'+item, {}, function (assert, william, socketio, roodles, whoa) {

    this.before(t => {
      console.log('before a');
    });

    this.it.cb('set timeout E', t => {
      setTimeout(function(){
        console.log('done 1');
        t.done();
      },200);
    });

  });


});




