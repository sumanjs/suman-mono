#!/usr/bin/env node
'use strict';

//core
import Domain = require('domain');
import util = require('util');

//npm
import su = require('suman-utils');
import chalk from 'chalk';
const dashdash = require('dashdash');
import residence = require('residence');

//project
import log from './logger';
import {registerReporter, options} from './utils';
import {getTestPointStream, getJSONStdioStream} from "./get-stream";

process.on('uncaughtException', function (e) {
  log.error(`<suman-r> has captured an 'uncaughtException' => \n ${su.getCleanErrorString(e)}`);
});

process.on('unhandledRejection', function (e) {
  log.error(`<suman-r> has captured an 'unhandledRejection' => \n ${su.getCleanErrorString(e)}`);
});

process.once('exit', function () {
  console.log('\n');
  log.info(' ---- suman-r end ----');
});

const projectRoot = residence.findProjectRoot(process.cwd());

if (!projectRoot) {
  log.error('suman-r could not find a project root given your current working directory.');
  log.error('cwd: ', process.cwd());
  throw new Error('suman-r could not find a project root given cwd.');
}

let opts, parser = dashdash.createParser({options});

try {
  opts = parser.parse(process.argv);
} catch (e) {
  log.error(' => suman-r CLI parsing error: %s', e.message);
  process.exit(1);
}

const defaultReporterPath = 'suman-reporters/modules/std-reporter';
registerReporter(projectRoot, opts.reporter || defaultReporterPath);

const to = setTimeout(function () {
  log.error(chalk.red('no input to suman-r stdin after 35 seconds, shutting down.'));
  process.exit(1);
}, 35000);

let clearStdinTimeout = function () {
  su.vgt(4) && log.info('Received first piece of stdin data.');
  clearTimeout(to);
};

{
  // here we run the testpoint data stream
  
  // let d = Domain.create();
  //
  // d.on('error', function (e) {
  //   log.error(su.getCleanErrorString(e));
  // });
  //
  // d.run(function () {
  //
  //   // we use a domain because nothing else seemed to capture the errors properly
  //   process.stdin.resume()
  //   .pipe(getTestPointStream())
  //   .once('data', clearStdinTimeout)
  //   .on('error', function (e: any) {
  //     log.error(su.getCleanErrorString(e));
  //   });
  //
  // });
  
}

{
  
  // here we run the stream for other data besides testpoint data
  
  let d = Domain.create();
  
  d.on('error', function (e) {
    log.error(su.getCleanErrorString(e));
  });
  
  d.run(function () {
    
    // we use a domain because nothing else seemed to capture the errors properly
    process.stdin.resume()
    .once('data', clearStdinTimeout)
    .pipe(getJSONStdioStream())
    .on('error', function (e: any) {
      log.error(su.getCleanErrorString(e));
    })
    .once('end', function () {
      console.log();
      log.info('suman-refine stdin has ended.');
    })
    .once('finish', function () {
      console.log();
      log.info('suman-refine stdin has finished.');
    });
    
  });
  
}






