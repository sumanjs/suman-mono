#!/usr/bin/env node
'use strict';

//core
import chalk from "chalk";

const util = require('util');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');

//project
const sumanIndex = process.env['SUMAN_LIBRARY_ROOT_PATH'];
const isDebug = process.env.suman_daemon_worker_debug === 'yes';

/////////////////////////////////////////////////////////////////////////////////////////

const log = {
  info: console.error.bind(console, chalk.cyan(`suman-daemon ${chalk.bold('worker')} info:`)),
  warn: console.error.bind(console, chalk.yellow.bold('suman-daemon worker warning:')),
  error: console.error.bind(console, chalk.redBright('suman-daemon worker error:')),
  debug: function (...args: string[]) {
    isDebug && console.error.call(console, chalk.magenta('suman-deamon worker debug:'), ...args);
  }
};

log.info('suamn daemon worker cwd:', process.cwd());


process.once('message', function (data: any) {

  // const _suman = global.__suman = (global.__suman || {});
  // _suman.absoluteLastHook = function () {};

  process.once('exit', function () {

    if (data.msg.pid === -1) {
      log.info('pid is -1, so we do not attempt to kill process.');
      return;
    }

    try {
      // cp.execSync(`kill -9 ${msg.msg.pid}`)
      cp.execSync(`kill -INT ${data.msg.pid}`)
    }
    catch (err) {
      log.error(err.message);
    }

  });

  if (data.msg.cwd) {
    log.debug('changing cwd to', data.msg.cwd);
    process.chdir(data.msg.cwd);
  }

  data.msg.args.forEach(function (a: string) {
    process.argv.push(a);
  });

  process.argv.push('--force-inception-level-zero');
  log.debug('process.arv => ', util.inspect(process.argv));
  process.env.SUMAN_EXTRANEOUS_EXECUTABLE = 'yes';
  require(path.resolve(sumanIndex + '/dist/cli.js'));

});

const sumanFilesToLoad = [
  'dist/exec-suite.js',
  'dist/suman.js',
  'dist/index.js'
];

process.once('SIGINT', function () {
  log.warn('SIGINT received by suman-daemon.');
  process.exit(1);
});

const pkgJSON = require(path.resolve(sumanIndex + '/package.json'));

sumanFilesToLoad.forEach(function (dep) {
  try {
    require(path.resolve(sumanIndex + '/' + dep));
  }
  catch (err) {
    log.error('foo:',err.message || err);
  }
});

let loadedCount = 0;

Object.keys(pkgJSON['dependencies'] || {}).forEach(function (k) {
  try {
    require(k); loadedCount++;
  }
  catch (err) {
    try {
      require(path.resolve(sumanIndex + '/node_modules/' + k)); loadedCount++;
    }
    catch (err) {
    }
  }
});


log.info('suman-daemon has preloaded ', loadedCount, 'modules/packages.');
