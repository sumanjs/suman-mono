'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

//npm
const async = require('async');
import chalk from 'chalk';

//project
const _suman = global.__suman = (global.__suman || {});

/////////////////////////////////////////////////////////////

const installsGroupA = [
  'install',
  '--save-dev',
  'istanbul@latest',
];

export const run = function (projectRoot: string) {
  
  console.log(' => Installing Istanbul dependency in your local project.');
  
  //TODO: probably don't need this block anymore
  if (false && !_suman.sumanOpts.force && !process.env.SUDO_UID) {
    console.log('You may wish to run the the commmand with root permissions, since you are installing globally');
    console.log(' => if using "sudo" makes you unhappy, try "# chown -R $(whoami) $(npm root -g) $(npm root) ~/.npm"');
    console.log(' => To override this message, use --force\n');
    return;
  }
  
  const i = setInterval(function () {
    process.stdout.write('.');
  }, 500);
  
  async.parallel([
      function (cb) {
        process.nextTick(cb);
      },
      function (cb) {
        const n = cp.spawn('npm', installsGroupA);
        
        n.on('close', function (code) {
          clearInterval(i);
          cb.apply(null, arguments);
        });
        
        n.stderr.setEncoding('utf-8');
        
        let first = true;
        
        n.stderr.on('data', function (d) {
          if (first) {
            first = false;
            clearInterval(i);
            console.log('\n');
          }
          console.error(d);
        });
      }
    ],
    
    function (err) {
      if (err) {
        console.log('\n', chalk.bgRed.white(' => Error => "Istanbul" was *not* installed ' +
          'successfully =>'), '\n', err.stack || err);
        process.exit(1);
      }
      else {
        console.log('\n\n', chalk.bgBlue.white.bold(' => Suman message => "istanbul" was installed ' +
          'successfully into your local project.'));
        console.log('\n', chalk.bgBlue.white.bold(' => To learn about how to use Istanbul ' +
          'with Suman, visit ***.'), '\n');
        process.exit(0);
      }
    });
  
};
