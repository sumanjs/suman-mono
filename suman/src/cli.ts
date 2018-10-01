#!/usr/bin/env node
'use strict';

//dts
import {IGlobalSumanObj, ISumanConfig} from "suman-types/dts/global";

export interface IPreOptCheck {
  [key: string]: any,
}

debugger;  //leave here forever so users can easily debug with "node --inspect" or "node debug"

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

/////////////////////////////////////////////////////////////////

let isLogExitCallable = true;

const logExit = function (code: number) {
  if (isLogExitCallable) {
    isLogExitCallable = false;
    console.log('\n');
    console.log(' => Suman cli exiting with code: ', code);
    console.log('\n');
  }
};

process.once('exit', function (code: number) {
  if (!global.__suman || !global.__suman.isActualExitHandlerRegistered) {
    logExit(code);
  }
});

if (require.main !== module && process.env.SUMAN_EXTRANEOUS_EXECUTABLE !== 'yes') {
  //prevents users from f*king up by accident and getting in an infinite process-spawn
  //loop that will lock up their entire system
  console.log('Warning: attempted to require Suman index.js but this cannot be.\n' +
    'Set the SUMAN_EXTRANEOUS_EXECUTABLE env variable to "yes" to get around this.');
  process.exit(1);
}
else {
  delete process.env['SUMAN_EXTRANEOUS_EXECUTABLE'];
}

/////////////////////////////////////////////////////////////////

function handleExceptionsAndRejections() {
  if (_suman && _suman.sumanOpts && (_suman.sumanOpts.ignore_uncaught_exceptions || _suman.sumanOpts.ignore_unhandled_rejections)) {
    console.error('\n => uncaughtException occurred, but we are ignoring due to the ' +
      '"--ignore-uncaught-exceptions" / "--ignore-unhandled-rejections" flag(s) you passed.');
  }
  else {
    console.error('\n => Use "--ignore-uncaught-exceptions" / "--ignore-unhandled-rejections" ' +
      'to force suman to continue despite the error.');
    process.exit(59); // we have not necessarily loaded suman-constants yet, so we hardcode.
  }
}

process.on('uncaughtException', function (err: Error) {
  
  debugger; // leave debugger statement here
  
  if (typeof err !== 'object') {
    console.error(new Error(`err passed to uncaughtException was not an object => ${err}`).stack);
    err = new Error(typeof err === 'string' ? err : util.inspect(err))
  }
  
  let _suman = global.__suman;
  
  if (String(err.stack || err).match(/Cannot find module/i) && _suman && _suman.sumanOpts && _suman.sumanOpts.transpile) {
    console.log(' => If transpiling, you may need to transpile your entire test directory to the destination directory using the ' +
      '--transpile and --all options together.')
  }
  
  setTimeout(function () {
    if (err && !err._alreadyHandledBySuman) {
      err._alreadyHandledBySuman = true;
      console.error('\n => Suman "uncaughtException" event occurred =>\n', chalk.magenta(err.stack), '\n\n');
      handleExceptionsAndRejections();
    }
  }, 500);
  
});

process.on('unhandledRejection', function (err: Error, p: Promise<any>) {
  
  debugger; // leave it here :)
  
  if (typeof err !== 'object') {
    console.error(new Error(`err passed to unhandledRejection was not an object => '${err}'`).stack);
    err = new Error(typeof err === 'string' ? err : util.inspect(err))
  }
  
  setTimeout(function () {
    if (err && !err._alreadyHandledBySuman) {
      err._alreadyHandledBySuman = true;
      console.error('\n\n => Suman "unhandledRejection" event occurred =>\n', (err.stack || err), '\n\n');
      handleExceptionsAndRejections();
    }
  }, 500);
  
});

//core
import cp = require('child_process');
import fs = require('fs');
import path = require('path');
import util = require('util');
import assert = require('assert');
import EE = require('events');
import os = require('os');
import domain = require('domain');
import vm = require('vm');
import tty = require('tty');

//npm
import semver = require('semver');
const dashdash = require('dashdash');
import chalk from 'chalk';
import async = require('async');
import su = require('suman-utils');
import _ = require('lodash');
const uniqBy = require('lodash.uniqby');
const {events} = require('suman-events');
import JSONStdio = require('json-stdio');

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
require('./helpers/add-suman-global-properties');
require('./patches/all');
import {loadReporters} from './helpers/load-reporters';
import {constants} from './config/suman-constants';
import * as general from "./helpers/general";

if (su.weAreDebugging) {
  _suman.log.info(' => Suman is in debug mode (we are debugging).');
  _suman.log.info(' => Process PID => ', process.pid);
}

//////////////////////////////////////////////////////////////////////////

if (su.vgt(6)) {
  _suman.log.info(chalk.magenta(' => Suman started with the following command:'), chalk.bold(util.inspect(process.argv)));
  _suman.log.info(`NODE_PATH env var is as follows: '${process.env['NODE_PATH']}'`);
}

//////////////////////////////////////////////////////////////////////////

_suman.log.info('Resolved path of Suman executable =>', '"' + __filename + '"');
const nodeVersion = process.version;
const oldestSupported = constants.OLDEST_SUPPORTED_NODE_VERSION;

if (semver.lt(nodeVersion, oldestSupported)) {
  _suman.log.error(chalk.red('warning => Suman is not well-tested against Node versions prior to ' +
    oldestSupported + '; your Node version: ' + chalk.bold(nodeVersion)));
  throw 'Please upgrade to a Node.js version newer than v6.0.0. Suman recommends usage of NVM.';
}

_suman.log.info('Node.js version:', chalk.bold(nodeVersion));

////////////////////////////////////////////////////////////////////

const sumanLibRoot = _suman.sumanLibRoot = String(__dirname);
const pkgJSON = require('../package.json');
const sumanVersion = process.env.SUMAN_GLOBAL_VERSION = pkgJSON.version;
_suman.log.info(chalk.italic('Suman ' + chalk.bold('v' + sumanVersion) + ' running...'));
_suman.log.info('[process.pid] => ', process.pid);

////////////////////////////////////////////////////////////////////

// all global config options reside here
_suman.startTime = Date.now();
const cwd = process.cwd();
const sumanExecutablePath = _suman.sumanExecutablePath = process.env.SUMAN_EXECUTABLE_PATH = __filename;

////////////////////////////////////////////////////////////////////

let userTrailingArgs, indexOfDoubleDash;
if ((indexOfDoubleDash = process.argv.indexOf('--')) > 0) {
  userTrailingArgs = [];
  while (true) {
    let v = process.argv.pop();
    if (v === '--') {
      break;
    }
    userTrailingArgs.unshift(v);
  }
}

const sumanOpts = _suman.sumanOpts = require('./parse-cmd-line-opts/parse-opts');
const viaSuman = _suman.viaSuman = true;
const rb = _suman.resultBroadcaster = _suman.resultBroadcaster || new EE();

/////////////////////////////////////////////////////////////////////

const configPath = sumanOpts.config;
const serverName = sumanOpts.server_name;
const convert = sumanOpts.convert_from_mocha;
const src = sumanOpts.src;
const dest = sumanOpts.dest;
const init = sumanOpts.init;
const uninstall = sumanOpts.uninstall;
const force = sumanOpts.force;
const fforce = sumanOpts.fforce;
const s = sumanOpts.server;
const installBabel = sumanOpts.install_babel;
const create = sumanOpts.create;
const installIstanbul = sumanOpts.use_istanbul;
const interactive = sumanOpts.interactive;
const appendMatchAny = sumanOpts.append_match_any;
const appendMatchAll = sumanOpts.append_match_all;
const appendMatchNone = sumanOpts.append_match_none;
const matchAny = sumanOpts.match_any;
const matchAll = sumanOpts.match_all;
const matchNone = sumanOpts.match_none;
const repair = sumanOpts.repair;
const groups = sumanOpts.groups;
const useTAPOutput = sumanOpts.use_tap_output;
const useTAPJSONOutput = sumanOpts.use_tap_json_output;
const fullStackTraces = sumanOpts.full_stack_traces;
const diagnostics = sumanOpts.diagnostics;
const installGlobals = sumanOpts.install_globals;
const postinstall = sumanOpts.postinstall;
const tscMultiWatch = sumanOpts.tsc_multi_watch;
const sumanShell = sumanOpts.suman_shell;
const watchPer = sumanOpts.watch_per;
const singleProcess = sumanOpts.single_process;
const script = sumanOpts.script;
const cwdAsRoot = sumanOpts.force_cwd_to_be_project_root;
const tap = sumanOpts.use_tap_output;
const tapJSON = sumanOpts.use_tap_json_output;
const userArgs = sumanOpts.user_arg = sumanOpts.user_arg || [];

userArgs.forEach(function (v: string) {
  process.argv.push(v);
});

if (userTrailingArgs) {
  //restore the user's arguments to process.argv, only after parsing arguments with dashdash
  userTrailingArgs.forEach(function (v) {
    userArgs.push(v);
    process.argv.push(v);
  });
}

// boolean options
const allowOnly = sumanOpts.$allowOnly = Boolean(sumanOpts.allow_only);
const allowSkip = sumanOpts.$allowSkip = Boolean(sumanOpts.allow_skip);
const coverage = sumanOpts.$coverage = Boolean(sumanOpts.coverage);
const browser = sumanOpts.$browser = Boolean(sumanOpts.browser);
const watch = sumanOpts.$watch = Boolean(sumanOpts.watch);

// string options

// array of string options
sumanOpts.transpile = Boolean(sumanOpts.transpile);
sumanOpts.$useTSNodeRegister = Boolean(sumanOpts.use_ts_node_register);
sumanOpts.$useBabelRegister = Boolean(sumanOpts.use_babel_register);
sumanOpts.$noBabelRegister = Boolean(sumanOpts.no_babel_register);
sumanOpts.$forceInheritStdio = Boolean(sumanOpts.force_inherit_stdio);

if(sumanOpts.$useTSNodeRegister){
  _suman.log.info('using ts-node to transpile tests.');
}

////////////////////////////////////////////////////////////////////////////////////////////////////

let projectRoot = _suman.projectRoot = process.env.SUMAN_PROJECT_ROOT = su.findProjectRoot(cwd);

///////////////////////////////////////////////////////////////////////////////////////////////////

if (!projectRoot) {
  if (!cwdAsRoot) {
    _suman.log.error('warning: A NPM project root could not be found given your current working directory.');
    _suman.log.error(chalk.red.bold('=> cwd:', cwd, ' '));
    _suman.log.error(chalk.red('=> Please execute the suman command from within the root of your project. '));
    _suman.log.error(chalk.red.italic('=> Suman looks for the nearest package.json file to determine the project root. '));
    _suman.log.error(chalk.red(`=> Consider using the ${chalk.red.bold('"--force-cwd-to-be-project-root"')} option.`));
    _suman.log.error(chalk.red('=> Perhaps you need to run "npm init" before running "suman --init", ' +
      'which will create a package.json file for you at the root of your project.'));
     process.exit(1);
  }
  
  projectRoot = _suman.projectRoot = process.env.SUMAN_PROJECT_ROOT = cwd;
}

if (su.vgt(7)) {
  _suman.log.info('Project root:', projectRoot);
}

if (cwd !== projectRoot) {
  if (su.vgt(1)) {
    _suman.log.info('Note that your current working directory is not equal to the project root:');
    _suman.log.info('cwd:', chalk.magenta(cwd));
    _suman.log.info('Project root:', chalk.magenta(projectRoot));
  }
}
else {
  if (su.vgt(2)) {
    if (cwd === projectRoot) {
      _suman.log.info(chalk.gray('cwd:', cwd));
    }
  }
  if (cwd !== projectRoot) {
    _suman.log.info(chalk.magenta('cwd:', cwd));
  }
}

if (singleProcess) {
  //TODO: this is wrong lol
  process.env.SUMAN_SINGLE_PROCESS = 'yes';
}

if (watch || watchPer) {
  if (String(process.env.SUMAN_WATCH_TEST_RUN).trim() === 'yes') {
    throw new Error('Suman watch process has launched a process which in turn will watch, this is not allowed.');
  }
}

if (sumanOpts.user_args) {
  _suman.log.info(chalk.magenta('raw user_args is'), sumanOpts.user_args);
}

if (coverage) {
  _suman.log.info(chalk.magenta.bold(
    'Coverage reports will be written out due to presence of --coverage flag.'
  ));
}

///////////////////////////////////////////////////////////////////////////////////////////////

if (sumanOpts.version) {
  console.log('\n');
  _suman.log.info('Node.js version:', nodeVersion);
  _suman.log.info('Suman version:', 'v' + sumanVersion);
  _suman.log.info('...And we\'re done here.', '\n');
  process.exit(0);
}

{
  
  // pre-load files using --require option
  
  const requireFile = general.makeRequireFile(projectRoot);
  su.flattenDeep([sumanOpts.require]).filter(v => v).forEach(function (s) {
    String(s).split(',')
    .map(v => String(v).trim())
    .filter(v => v)
    .forEach(requireFile);
  });
  
}

{
  
  // check for cmd line options contradictions
  
  const makeThrow = function (msg: string) {
    console.log('\n');
    console.error('\n');
    throw msg;
  };
  
  if (sumanOpts.transpile && sumanOpts.no_transpile) {
    makeThrow(' => Suman fatal problem => --transpile and --no-transpile options were both set,' +
      ' please choose one only.');
  }
  
  if (sumanOpts.append_match_all && sumanOpts.match_all) {
    makeThrow(' => Suman fatal problem => --match-all and --append-match-all options were both set,' +
      ' please choose one only.');
  }
  
  if (sumanOpts.append_match_any && sumanOpts.match_any) {
    makeThrow(' => Suman fatal problem => --match-any and --append-match-any options were both set,' +
      ' please choose one only.');
  }
  
  if (sumanOpts.append_match_none && sumanOpts.match_none) {
    makeThrow(' => Suman fatal problem => --match-none and --append-match-none options were both set,' +
      ' please choose one only.');
  }
  
  if (sumanOpts.watch && sumanOpts.stop_watching) {
    makeThrow('=> Suman fatal problem => --watch and --stop-watching options were both set, ' +
      'please choose one only.');
  }
  
  if (sumanOpts.babel_register && sumanOpts.no_babel_register) {
    makeThrow('=> Suman fatal problem => --babel-register and --no-babel-register command line options were both set,' +
      ' please choose one only.');
  }
  
}

////////////////////////////////////////////////////////////////////////////////////

let sumanConfig;

{
  
  // load suman.conf.js file
  
  let pth;
  
  try {
    //TODO: There's a potential bug where the user passes a test path to the config argument like so --cfg path/to/test
    pth = path.resolve(configPath || (cwd + '/' + 'suman.conf.js'));
    sumanConfig = _suman.sumanConfig = require(pth);
  }
  catch (err) {
    
    _suman.log.warning(chalk.yellow(err.message));
    if (!/Cannot find module/i.test(err.stack)) {
      log.error(err.stack);
      return process.exit(1);
    }
    
    if (!init) {
      // if init option is flagged to true, we don't expect user to have a suman.conf.js file, duh
      _suman.log.warning(chalk.yellow('Warning: Could not load your config file ' +
        'in your current working directory or given by --cfg at the command line...'));
      _suman.log.warning(chalk.yellow('...are you sure you issued the suman command in the right directory? ' +
        '...now looking for a config file at the root of your project...'));
    }
    
    try {
      pth = path.resolve(projectRoot + '/' + 'suman.conf.js');
      sumanConfig = _suman.sumanConfig = require(pth);
      if (sumanOpts.verbosity > 2) {  //default to true
        _suman.log.info(chalk.cyan('=> Suman config used: ' + pth + '\n'));
      }
    }
    catch (err) {
      _suman.usingDefaultConfig = true;
      _suman.log.warning(`Warning: suman is using a default 'suman.conf.js' file.`);
      _suman.log.warning(`Please create your own 'suman.conf.js' file using "suman --init".`);
      sumanConfig = _suman.sumanConfig = require('./default-conf-files/suman.default.conf.js');
    }
  }
  
  if (sumanOpts.verbosity > 8) {  //default to true
    _suman.log.info(' => Suman verbose message => Suman config used: ' + pth);
  }
  
}

//////////////////////////////////////////////////////////////////////////////////////////////

let sumanInstalledLocally = null;
let sumanInstalledAtAll = null;
let sumanServerInstalled = null;

{
  // set up sumanConfig etc.
  
  if (init) {
    _suman.log.info(chalk.magenta(' => "suman --init" is running.'));
    // TODO: force empty config if --init option given?
    sumanConfig = _suman.sumanConfig = _suman.sumanConfig || {} as ISumanConfig;
  }
  else {
    
    const {vetLocalInstallations} = require('./cli-helpers/determine-if-suman-is-installed');
    const installObj = vetLocalInstallations(sumanConfig, sumanOpts, projectRoot);
    sumanInstalledAtAll = installObj.sumanInstalledAtAll;
    sumanServerInstalled = installObj.sumanServerInstalled;
    sumanInstalledLocally = installObj.sumanInstalledLocally;
  }
  
  const sumanPaths = general.resolveSharedDirs(sumanConfig, projectRoot, sumanOpts);
  const sumanObj = general.loadSharedObjects(sumanPaths, projectRoot, sumanOpts);
}

////////////// Here we reconcile and merge command line args with config  ///////////////////////////////
///////////// as usual, command line args take precedence over static configuration (suman.conf.js) /////

if (sumanOpts.parallel && sumanOpts.series) {
  throw chalk.red('Suman usage error => "--series" and "--parallel" options were both used, ' +
    'please choose one or neither...but not both!');
}

if ('concurrency' in sumanOpts) {
  assert(Number.isInteger(sumanOpts.concurrency) && Number(sumanOpts.concurrency) > 0,
    chalk.red('Suman usage error => "--concurrency" option value should be an integer greater than 0.'));
}

_suman.maxProcs = sumanOpts.concurrency || sumanConfig.maxParallelProcesses || 15;

{
  // using TAP output
  sumanOpts.$useTAPOutput = _suman.useTAPOutput = sumanConfig.useTAPOutput || useTAPOutput;
  sumanOpts.$useTAPOutput && _suman.log.info('Using TAP output => ', sumanOpts.$useTAPOutput);
}

{
  // using TAP-JSON output
  sumanOpts.$useTAPJSONOutput = _suman.useTAPJSONOutput = sumanConfig.useTAPJSONOutput || useTAPJSONOutput;
  sumanOpts.$useTAPJSONOutput && _suman.log.info('Using TAP-JSON output => ', sumanOpts.$useTAPJSONOutput);
}

sumanOpts.$fullStackTraces = sumanConfig.fullStackTraces || sumanOpts.full_stack_traces;

/////////////////////////////////// matching ///////////////////////////////////////

/* if matchAny is passed it overwrites anything in suman.conf.js, same goes for matchAll, matchNone
 however, if appendMatchAny is passed, then it will append to the values in suman.conf.js */

const sumanMatchesAny = (matchAny || (sumanConfig.matchAny || []).concat(appendMatchAny || []))
.map((item: RegExp | string) => (item instanceof RegExp) ? item : new RegExp(item));

const sumanMatchesNone = (matchNone || (sumanConfig.matchNone || []).concat(appendMatchNone || []))
.map((item: RegExp | string) => (item instanceof RegExp) ? item : new RegExp(item));

const sumanMatchesAll = (matchAll || (sumanConfig.matchAll || []).concat(appendMatchAll || []))
.map((item: RegExp | string) => (item instanceof RegExp) ? item : new RegExp(item));

_suman.sumanMatchesAny = uniqBy(sumanMatchesAny, (item: RegExp) => item);
_suman.sumanMatchesNone = uniqBy(sumanMatchesNone, (item: RegExp) => item);
_suman.sumanMatchesAll = uniqBy(sumanMatchesAll, (item: RegExp) => item);

if (sumanMatchesAny.length < 1) {
  // if the user does not provide anything, we default to this
  _suman.log.warning('No runnable file regexes available; using the default => /\.js$/');
  _suman.sumanMatchesAny.push(/\.js$/);
}

/////////////////////////////// abort if too many top-level options //////////////////////////////////////

{
  
  // check to make sure we don't have more than one primary command line option
  
  const preOptCheck = <IPreOptCheck> {
    tscMultiWatch, watch, watchPer,
    create, installBabel,
    installIstanbul, init, uninstall,
    convert, groups, s, interactive,
    diagnostics, installGlobals, postinstall,
    repair, sumanShell, script
  };
  
  const optCheck = Object.keys(preOptCheck).filter(function (key, index) {
    // we return non-falsy values
    return preOptCheck[key];
  })
  .map(function (key) {
    const value = preOptCheck[key];
    const obj = <Partial<IPreOptCheck>> {};
    obj[key] = value;
    return obj;
  });
  
  if (optCheck.length > 1) {
    console.error('\t => Too many options, pick one from:\n', util.inspect(Object.keys(preOptCheck)));
    console.error('\t => Current options used were:\n', util.inspect(optCheck));
    console.error('\t => Use --help for more information.\n');
    console.error('\t => Use --examples to see command line examples for using Suman in the intended manner.\n');
    process.exit(constants.EXIT_CODES.BAD_COMMAND_LINE_OPTION);
  }
}

/////////////////////////////// load reporters  ////////////////////////////////

loadReporters(sumanOpts, projectRoot, sumanConfig);

////////////////////////////////////////////////////////////////////////////////

rb.emit(String(events.NODE_VERSION), nodeVersion);
rb.emit(String(events.SUMAN_VERSION), sumanVersion);

//note: whatever args are remaining are assumed to be file or directory paths to tests

let paths = su.flattenDeep([sumanOpts._args]).slice(0);

{
  
  // resolve / map test file paths
  
  if (sumanOpts.test_paths_json) {
    let jsonPaths = JSON.parse(String(sumanOpts.test_paths_json).trim());
    jsonPaths.forEach(function (p: string) {
      paths.push(p);
    });
  }
  
  if (sumanOpts.replace_match && sumanOpts.replace_with) {
    paths = paths.map(function (p: string) {
      return String(p).replace(sumanOpts.replace_match, sumanOpts.replace_with);
    });
  }
  
  if (sumanOpts.replace_ext_with) {
    paths = paths.map(function (p: string) {
      return String(p).substr(0, String(p).lastIndexOf('.')) + sumanOpts.replace_ext_with;
    });
  }
  
  if (su.vgt(7)) {
    _suman.log.info('arguments assumed to be test file paths to be run:', paths);
  }
}

/////////////////// check to make sure --tap option is used if we are piping ////////////////////

let isTTY = process.stdout.isTTY;

if (su.vgt(7)) {
  if (isTTY) {
    _suman.log.error('process.stdout appears to be a TTY.');
  }
  else {
    _suman.log.error('process.stdout appears to *not* be a TTY.');
  }
}

let isFifo;

try {
  isFifo = fs.fstatSync(1).isFIFO();
}
catch (err) {
  _suman.log.error('process.stdout is not a FIFO.');
  _suman.log.error(err.stack);
}

if (su.vgt(7)) {
  if (isFifo) {
    _suman.log.info('process.sdtout appears to be a FIFO.');
    _suman.log.error('process.stdout appears to be a FIFO.');
  }
  else {
    _suman.log.info('process.sdtout appears to *not* be a FIFO.');
    _suman.log.error('process.stdout appears to *not* be a FIFO.');
  }
}

if (String(process.env.SUMAN_WATCH_TEST_RUN).trim() !== 'yes') {
  if (!isTTY && !useTAPOutput) {
    
    if (!tapJSON) {
      // let writeToSumanRStdout = JSONStdio.initLogToStdout(su.constants.JSON_STDIO_SUMAN_R);
      let messages = [
        'You may need to turn on TAP output for test results to be captured in destination process.',
        'Try using the "--tap" or "--tap-json" options at the suman command line.'
      ];
      
      _suman.log.error(chalk.yellow.bold(messages.join('\n')));
      JSONStdio.logToStdout({sumanMessage: true, kind: 'warning', messages: messages});
      // writeToSumanRStdout({sumanMessage: true, kind: 'warning', messages: messages});
    }
    
  }
}

////////////////////// dynamically call files to minimize load, etc //////////////////////////////

if (diagnostics) {
  require('./cli-commands/run-diagnostics').run(sumanOpts);
}
else if (script) {
  require('./cli-commands/run-scripts').run(sumanConfig, sumanOpts);
}
else if (tscMultiWatch) {
  require('./cli-commands/run-tscmultiwatch').run(sumanOpts);
}
else if (repair) {
  require('./cli-commands/run-repair').run(sumanOpts);
}
else if (postinstall) {
  require('./cli-commands/postinstall').run(sumanOpts);
}
else if (installGlobals) {
  require('./cli-commands/install-global-deps')(paths);
}
else if (sumanShell) {
  debugger;
  require('./cli-commands/run-suman-shell').run(projectRoot, sumanLibRoot, sumanOpts.suman_d_opts)
}
else if (interactive) {
  require('./cli-commands/run-suman-interactive').run();
}
else if (installIstanbul) {
  require('./cli-commands/install-istanbul').run();
}
else if (create) {
  require('./cli-commands/create-opt').run(create);
}
else if (installBabel) {
  require('./cli-commands/install-babel').run(null);
}
else if (init) {
  require('./cli-commands/init-opt').run(sumanOpts, projectRoot, cwd);
}
else if (uninstall) {
  require('./cli-commands/uninstall').run(sumanOpts);
}
else if (convert) {
  require('./cli-commands/convert-mocha').run(projectRoot, src, dest, force);
}
else if (s) {
  require('./cli-commands/start-suman-server')(sumanServerInstalled, sumanConfig, serverName);
}
else if (!browser && (watch || watchPer)) {
  require('./cli-commands/watching').run(projectRoot, paths, sumanOpts, sumanConfig);
}
else if (groups) {
  require('./cli-commands/groups').run(paths);
}

else {
  //this path runs all tests
  if (userArgs.length > 0 && sumanOpts.verbosity > 4) {
    _suman.log.info('The following "--user-arg" arguments will be passed to child processes as process.argv:');
    _suman.log.info(userArgs);
  }
  
  require('./run').run(sumanOpts, sumanConfig, paths, sumanServerInstalled, sumanVersion);
}



