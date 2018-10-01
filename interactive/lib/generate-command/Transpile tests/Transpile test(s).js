'use strict';

//core

//npm
const inquirer = require('suman-inquirer');

//project
const _suman = global.__suman = (global.__suman || {});
const interactive = _suman.interactive = _suman.interactive || {};
const {log} = require('../../logging');


//////////////////////////////////////////////////////


module.exports = function makePromise(){

  return inquirer.prompt([

    {
      type: 'confirm',
      name: 'suman',
      message: 'ppppppppppp',
      when: function () {
        return true;
      }
    },

  ]).then(function(answers){

    console.log(' answers in Istanbul test => ', answers);

  });




};
