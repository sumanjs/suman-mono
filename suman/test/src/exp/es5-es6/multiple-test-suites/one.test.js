const suman = require('suman');
const Test = suman.init(module, {
  pre: ['smartconnect'],
  post: ['judas']
});

Test.create('1', {}, function (assert) {

  this.before(t => {
    console.log('before a');
  });

  this.it.cb('set timeout X', t => {
    setTimeout(function () {
      console.log('done 1');
      t.done();
    }, 1000);
  });

});

Test.create('2', {}, function (assert) {

  this.before.cb(t => {
    console.log('before a');
    setTimeout(function () {
      // throw new Error('oh shit');
      t.done();
    }, 1000);
  });

  this.it.cb('set timeout X', t => {
    setTimeout(function () {
      console.log('done 2');
      t.done();
    }, 1000);
  });

});


