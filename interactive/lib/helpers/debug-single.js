'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const assert = require('assert');
const util = require('util');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

//npm
const colors = require('colors/safe');
const inquirer = require('suman-inquirer');
const su = require('suman-utils');

//project
const _suman = global.__suman = (global.__suman || {});
const interactive = _suman.interactive = _suman.interactive || {};
const {log} = require('../logging');
const rejectionHandler = require('../interactive-rejection-handler');
const choices = require('./choices');

//////////////////////////////////////////////////////////////

module.exports = function debugSingle(opts, backspaceCB) {

  const exec = opts.exec;

  return inquirer.prompt([
    {
      type: 'list',
      name: 'debugCmd',
      message: 'Which technique would you like to use to debug your tests?',
      onLeftKey: function () {
        _suman.onBackspace(backspaceCB);
      },
      when: function () {
        console.log('\n\n ----------------------------------------------- \n\n');
        return true;
      },
      choices: exec === 'node' ? choices.nodeDebug : choices.sumanDebug,
      filter: function (val) {
        return val;
      }
    },

  ]).then(function (answers) {
    console.warn('answers in debug-single =>', answers);
    return Object.assign(opts, answers);
  });

};
