//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const assert = require('assert');
const util = require('util');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const su = require('suman-utils');

//npm
const async = require('async');
const colors = require('colors/safe');

//project
const _suman = global.__suman = (global.__suman || {});
const interactive = _suman.interactive = _suman.interactive || {};
const {log} = require('../logging');

////////////////////////////////////////////////////////////////////////////////

module.exports = Object.freeze({

  nodeDebug: [

    {
      name: 'node debug x.js',
      value: 'node debug'
    },
    {
      name: 'node --debug-brk=5858 x.js (Run this command in one terminal, and then run "node debug localhost:5858" in another terminal)',
      value: 'node --debug-brk=5858'
    },
    {
      name: 'node --inspect x.js',
      value: 'node --inspect'
    },
    {
      name: '...I have Webstorm, can\'t I use that to debug?',
      value: 'webstorm'
    }

  ],

  sumanDebug: [
    {
      name: 'suman-debug x.js (more or less equivalent in functionality to "node debug x.js")',
      value: 'suman-debug'
    },
    {
      name: 'suman--debug x.js (more or less equivalent in functionality to "node --debug-brk=5858 x.js")',
      value: 'suman--debug'
    },
    {
      name: 'suman-inspect x.js (more or less equivalent in functionality to node --inspect x.js)',
      value: 'suman-inspect'
    }

  ],

  localOrGlobalChoices: [
    {
      value: 'global',
      name: 'Globally installed ($ suman )',
    },
    {
      value: 'local',
      name: 'Locally installed ($ ./node_modules/.bin/suman )',
    }

  ],

  nodeOrSuman: [
    {
      value: 'node',
      name: '$ node your-test.js',
    },
    {
      value: 'suman',
      name: '$ suman your-test.js',
    }
  ],

  topLevelOpts: {
    'GenerateCommand': ' (1) Generate a valid Suman terminal command',
    'Troubleshoot': ' (2) Troubleshoot/debug test(s)',
    'Learn': ' (3) Learn the Suman API'
  }

});
