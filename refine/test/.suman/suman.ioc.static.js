//******************************************************************************************************************
// this is for dependency injection, y'all
// the purpose is to inject dependencies / values that are acquired *asynchronously*
// synchronous deps should be loaded with the require function, as per usual,
// but deps and values (such as db values) can and should be loaded via this module
// tests will run in separate processes, but you can use code sharing (not memory sharing) to share setup between tests,
// which is actually pretty cool
// ******************************************************************************************************************

const http = require('http');

module.exports = $core => {  //load async deps for any of your suman tests

  return {

    dependencies: {

      //the following are examples

      //synchronous dependency acquisition
      'example': function () {
        return {'just': 'an example'};
      },

      //asynchronous dependency acquisition, pass data back to test files using error-first callback


      //asynchronous dependency acquisition, return a Promise

      'fs_search': () => {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('some filesystem values')
          }, 10);
        });
      }
    }

  }

};
