'use strict';

//dts
import {MapToTargetDirResult, INearestRunAndTransformRet, IMapCallback} from "suman-types/dts/suman-utils";
import {IGlobalSumanObj} from "suman-types/dts/global";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

process.on('warning', function (w: any) {
  console.error('suman-utils warning => ', (w.stack || w), '\n');
});

//core
import * as fs from 'fs';
import * as path from 'path';
import util = require('util');
import assert = require('assert');
import events = require('events');

//npm
import async = require('async');
const residence = require('residence');
const mkdirp = require('mkdirp');


//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
const isX = require('./is-x');
const toStr = Object.prototype.toString;
import log from './logger';
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*(?:function)?\*/;
export {weAreDebugging} from './we-are-debugging'
export {constants} from './constants'
const EventEmitter = events.EventEmitter;
import Timer = NodeJS.Timer;
import {ErrorCallback} from "async";


export type ErrnoExceptionType = (err: any) => void;

/////////////////////////////////////////////////////////////////////////////

let globalProjectRoot: string;

export const isStream = isX.isStream;
export const isObservable = isX.isObservable;
export const isSubscriber = isX.isSubscriber;
export const noop = function () {
};


export const r2gSmokeTest = (): boolean => {
  return true;
};


export const newLine = '\n';

export const isEventEmitter = function (val: any) {
  return val && ((val instanceof EventEmitter) ||
    (typeof val.once === 'function' && typeof val.on === 'function'
      && typeof val.removeListener === 'function' && typeof val.removeAllListeners === 'function'));
};

export const vgt = function (val: number): boolean {
  return _suman.sumanOpts && _suman.sumanOpts.verbosity > val;
};

export const vlt = function (val: number): boolean {
  return _suman.sumanOpts && _suman.sumanOpts.verbosity < val;
};

export const checkStatsIsFile = function (item: string) {
  
  try {
    return fs.statSync(item).isFile();
  }
  catch (err) {
    if (vgt(2)) {
      log.error('warning:', err.stack);
    }
    return null;
  }
};

export const flattenDeep = (a: any): Array<any> => {
  return Array.isArray(a) ? a.reduce( (a, b) => [...flattenDeep(a), ...flattenDeep(b)] , []) : [a];
};

export const mapToTargetDir = function (item: string): MapToTargetDirResult {
  
  const projectRoot = process.env.SUMAN_PROJECT_ROOT;
  // note => these values were originally assigned in suman/index.js,
  // were then passed to suman server, which then required this file
  
  // const testDir = process.env.TEST_DIR;
  // const testSrcDir = process.env.TEST_SRC_DIR;
  
  const testTargetDir = process.env.TEST_TARGET_DIR;
  const testTargetDirLength = String(testTargetDir).split(path.sep).length;
  
  item = path.resolve(path.isAbsolute(item) ? item : (projectRoot + '/' + item));
  
  let itemSplit = String(item).split(path.sep);
  itemSplit = itemSplit.filter(i => i); // get rid of pesky ['', first element
  
  const originalLength = itemSplit.length;
  const paths = removeSharedRootPath([projectRoot, item]);
  const temp = paths[1][1];
  
  let splitted = temp.split(path.sep);
  splitted = splitted.filter(i => i); // get rid of pesky ['', first element
  
  while ((splitted.length + testTargetDirLength) > originalLength + 1) {
    splitted.shift();
  }
  
  const joined = splitted.join(path.sep);
  
  return {
    originalPath: item,
    targetPath: path.resolve(testTargetDir + '/' + joined)
  }
};

export const findApplicablePathsGivenTransform = function (sumanConfig: Object, transformPath: string, cb: Function) {
  
  const dir = path.dirname(transformPath);
  const results: Array<string> = [];
  
  let firstPass = true;
  
  (function searchDir(dir: string, cb: Function) {
    
    fs.readdir(dir, function (err, items) {
      
      if (firstPass === false) {
        for (let i = 0; i < items.length; i++) {
          if (String(items[i]).match(/@transform.sh/)) {
            return process.nextTick(cb);
          }
        }
      }
      
      // after this, we are in subdirectories
      firstPass = false;
      
      async.eachLimit(items as any, 3, function (item: string, cb: Function) {
        
        const fullPath = path.resolve(dir + '/' + item);
        
        fs.stat(fullPath, function (err, stats) {
          
          if (err) {
            log.error(err.stack);
            return cb();
          }
          
          if (stats.isFile()) {
            if (String(fullPath).match(/\/@src\//)) {
              results.push(fullPath);
            }
            return cb();
          }
          
          if (stats.isDirectory()) {
            
            if (String(fullPath).match(/\/node_modules\//)) {
              return cb();
            }
            
            searchDir(fullPath, cb);
            
          }
          
        });
        
      }, cb as any);
    });
    
  })(dir, function (err: Error) {
    
    cb(err, results);
    
  });
  
};

export const isSumanSingleProcess = function (): boolean {
  return process.env.SUMAN_SINGLE_PROCESS === 'yes';
};

export const isSumanDebug = function (cb?: Function): boolean {
  let isDebug = process.env.SUMAN_DEBUG === 'yes';
  isDebug && cb && cb();
  return isDebug;
};

export const runAssertionToCheckForSerialization = function (val: Object): void {
  if (!val) {
    return;
  }
  assert(['string', 'boolean', 'number'].indexOf(typeof val) >= 0,
    ' => Suman usage error => You must serialize data called back from suman.once.pre.js value functions, ' +
    'here is the data in raw form =>\n' + val + ' and here we have run util.inspect on it =>\n' + util.inspect(val));
};

export const buildDirsWithMkDirp = function (paths: Array<string>, cb: ErrorCallback<any>): void {
  async.each(paths as any, mkdirp, cb);
};

export const getArrayOfDirsToBuild = function (testTargetPath: string, p: string): string | undefined {
  
  // => p is expected to be a path to a file, not a directory
  let temp: string = '';
  const l = path.normalize('/' + testTargetPath).split('/').length;
  const items = path.normalize('/' + p).split('/');
  
  if (fs.statSync(p).isFile()) {
    items.pop(); // always get rid of the first file
  }
  
  if (items.length >= l) {
    temp = path.normalize(items.slice(l).join('/'));
  }
  else {
    console.log('\n');
    log.error('warning: path to file was not longer than path to test-target dir.');
    log.error('warning: path to file =>', p);
    log.error('warning: testTargetDir =>', testTargetPath);
    console.log('\n');
  }
  
  if (temp) {
    return path.resolve(testTargetPath + '/' + temp);
  }
  
  //explicit for your pleasure; and so TS does not complain
  return undefined;
  
};

export const checkIfPathAlreadyExistsInList = function (paths: Array<string>, p: string, index: number): boolean {
  
  // assume paths =>  [/a/b/c/d/e]
  // p => /a/b/c
  // this fn should return true then
  
  return paths.some(function (pth, i) {
    if (i === index) {
      // we ignore the matching item
      return false;
    }
    return String(pth).indexOf(p) === 0;
  });
  
};

export const buildDirs = function (dirs: Array<string>, cb: ErrorCallback<any>): void {
  
  if (dirs.length < 1) {
    return process.nextTick(cb);
  }
  
  async.eachSeries(dirs as any, function (item: string, cb: Function): void {
    
    fs.mkdir(item, function (err: Error) {
      if (err && !String(err.stack).match(/eexist/i)) {
        log.error(err.stack || err);
        return cb(err);
      }
      
      cb(null);
    });
    
  }, cb);
  
};

export const padWithFourSpaces = function (): string {
  return new Array(5).join(' ');  //yields 4 whitespace chars
};

export const padWithXSpaces = function (x: number): string {
  return new Array(x + 1).join(' ');  //yields x whitespace chars
};

export const removePath = function (p1: string, p2: string): string {
  
  assert(path.isAbsolute(p1) && path.isAbsolute(p2), 'Please pass in absolute paths, ' +
    'p1 => ' + util.inspect(p1) + ', p2 => ' + util.inspect(p2));
  
  const split1 = String(p1).split(path.sep);
  const split2 = String(p2).split(path.sep);
  
  const newPath: Array<string> = [];
  
  const max = Math.max(split1.length, split2.length);
  
  for (let i = 0; i < max; i++) {
    if (split1[i] !== split2[i]) {
      newPath.push(split1[i]);
    }
  }
  
  return newPath.join(path.sep);
  
};

export const findSharedPath = function (p1: string, p2: string): string {
  
  const split1 = String(p1).split(path.sep);
  const split2 = String(p2).split(path.sep);
  
  //remove weird empty strings ''
  const one = split1.filter(i => i);
  const two = split2.filter(i => i);
  
  const max = Math.max(one.length, two.length);
  
  // if (split1[0] === '') {
  //     split1.shift();
  // }
  //
  // if (split2[0] === '') {
  //     split2.shift();
  // }
  
  let i = 0;
  let shared: Array<string> = [];
  
  while (one[i] === two[i] && i < max) {
    shared.push(one[i]);
    i++;
    if (i > 100) {
      throw new Error('Suman implementation error => first array => ' + one + ', ' +
        'second array => ' + two);
    }
  }
  
  shared = shared.filter(i => i);
  return path.resolve(path.sep + shared.join(path.sep));
};

export const removeProjectRootFromPath = function (p: string) {
  const projectRootLn = _suman.projectRoot.length;
  return p.slice(projectRootLn);
};

export const removeSharedRootPath = function (paths: Array<string>): Array<Array<string>> {
  
  if (paths.length < 2) {   //  paths = ['just/a/single/path/so/letsreturnit']
    return paths.map(function (p) {
      return [p, path.basename(p), removeProjectRootFromPath(p)];
    });
  }
  
  let shared: string | Array<string>;
  
  paths.forEach(function (p) {
    
    //assume paths are absolute before being passed here
    p = path.normalize(p);
    
    if (shared) {
      const arr = String(p).split('');
      
      let i = 0;
      
      arr.every(function (item, index) {
        if (String(item) !== String(shared[index])) {
          i = index;
          return false;
        }
        return true;
      });
      
      shared = shared.slice(0, i);
      
    }
    else {
      shared = String(p).split('');
    }
    
  });
  
  return paths.map(function (p) {
    const basenameLngth = path.basename(p).length;
    return [
      p,
      p.substring(Math.min(shared.length, (p.length - basenameLngth)), p.length),
      removeProjectRootFromPath(p)
    ];
  });
  
};

export const checkForValInStr = function (str: string, regex: RegExp, count: number): boolean {
  //used primarily to check if 'done' literal is in fn.toString()
  return ((String(str).match(regex) || []).length > (count === 0 ? 0 : (count || 1)));
};

export const isGeneratorFn2 = function (fn: Function): boolean {
  const str = String(fn);
  const indexOfFirstParen = str.indexOf('(');
  const indexOfFirstStar = str.indexOf('*');
  return indexOfFirstStar < indexOfFirstParen;
};

export const isGeneratorFn = function (fn: Function): boolean {
  
  if (typeof fn !== 'function') {
    return false;
  }
  
  let fnStr = toStr.call(fn);
  
  return ((fnStr === '[object Function]' || fnStr === '[object GeneratorFunction]') && isFnRegex.test(fnToStr.call(fn))
    || (fn.constructor &&
      (fn.constructor.name === 'GeneratorFunction' || (fn.constructor as any).displayName === 'GeneratorFunction')));
  
};

export const isArrowFunction = function (fn: Function): boolean {
  //TODO this will not work for async functions!
  return fn && String(fn).trim().indexOf('function') !== 0;
};

export const isAsyncFn = function (fn: Function): boolean {
  return fn && String(fn).trim().indexOf('async ') === 0;
};

export const defaultSumanHomeDir = function (): string {
  return path.normalize(path.resolve((process.env.HOME || process.env.USERPROFILE) + path.sep + 'suman_data'));
};

export const defaultSumanResultsDir = function (): string {
  return path.normalize(path.resolve(getHomeDir() + path.sep + 'suman' + path.sep + 'test_results'));
};

export const getHomeDir = function (): string {
  return process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
};

export const findProjectRoot = function (p: string): string {
  if (!globalProjectRoot) {
    globalProjectRoot = residence.findProjectRoot(p);
  }
  return globalProjectRoot;
};

export const findProjRoot = findProjectRoot;

export const once = function (ctx: Object, fn: Function): Function {
  
  let callable = true;
  return function callOnce(err: Error) {
    if (callable) {
      callable = false;
      return fn.apply(ctx, arguments);
    }
    else {
      _suman.log.warning('Suman implementation warning => function was called more than once => ' + fn ? fn.toString() : '');
      err && _suman.log.error('warning:', err.stack || util.inspect(err));
    }
  }
};

export const onceWithCache = function (fn: Function) {
  let cache: any = null;
  
  return function (cb: Function) {
    
    if (cache) {
      return process.nextTick(cb, null, cache);
    }
    
    fn.call(null, function (err: Error, val: any) {
      if (!err) {
        cache = val || {'Suman says': 'This is a dummy-cache val. See => sumanjs.org/tricks-and-tips.html'};
      }
      cb.call(null, err, cache);
    });
    
  }
};

export const onceTO = function (ctx: Object, fn: Function, to: Timer): Function {
  let callable = true;
  return function callOnce(err: Error) {
    if (callable) {
      callable = false;
      clearTimeout(to);
      return fn.apply(ctx, arguments);
    }
    else {
      _suman.log.warning('suman implementation warning => function was called more than once => ' + fn ? fn.toString() : '');
      err && _suman.log.error('warning => ', err.stack || util.inspect(err));
    }
  }
};

export const getArgumentNames = function (fn: Function | string) {
  
  // this code was borrowed from require('function-arguments') NPM package
  let isString = false;
  
  if (typeof fn === 'function') {
    if (fn.length === 0) {
      return []
    }
  }
  else if (typeof fn !== 'string') {
    throw new Error('Argument must be either a string or function.');
  }
  else {
    isString = true;
  }
  
  // from https://github.com/jrburke/requirejs
  let reComments = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
  
  let toString = Function.prototype.toString;
  let fnStr = isString ? fn : toString.call(fn);
  
  fnStr = fnStr.replace(reComments, '') || fnStr;
  fnStr = fnStr.slice(0, fnStr.indexOf('{'));
  
  let open = fnStr.indexOf('(');
  let close = fnStr.indexOf(')');
  
  open = open >= 0 ? open + 1 : 0;
  close = close > 0 ? close : fnStr.indexOf('=');
  
  fnStr = fnStr.slice(open, close);
  fnStr = '(' + fnStr + ')';
  
  let match = fnStr.match(/\(([\s\S]*)\)/);
  return match ? match[1].split(',').map((param: string) => String(param).trim()) : []
  
};

export const getCleanErrorString = function (e: any): string {
  
  if (!e) {
    return String(new Error('falsy value passed to error string extractor.').stack);
  }
  
  if (typeof (e.stack || e) === 'string') {
    return e.stack || e;
  }
  
  return util.inspect(e.stack || e);
  
};

// create simple alias
export const getCleanErrStr = getCleanErrorString;

export const xNewLines = function (count: number) {
  return new Array(count + 1).join('\n');  //yields 4 whitespace chars
};

export const isArrayOrFunction = function (o: any) {
  return Array.isArray(o) || typeof o === 'function';
};

export const decomposeError = function (err: any) {
  if (!err) {
    return new Error('error was null or undefined').stack;
  }
  if (typeof err.stack === 'string') {
    return err.stack;
  }
  return typeof err === 'string' ? err : util.inspect(err);
};

export const repeatCharXTimes = function (char: string, num: number) {
  if (String(char).length < 1) {
    throw new Error('string must be at least 1 character in length.');
  }
  return new Array(num).join(char);
};

export const createCleanStack = function (str: String, $ignore?: Array<string | RegExp>) {
  
  const ignore = ($ignore || [/node_modules/, /next_tick.js/]).map(function (r) {
    return r instanceof RegExp ? r : new RegExp(r);
  });
  
  return String(str).split('\n').filter(function (s) {
    
    if (/\/sumanjs\/test\//.test(s)) {
      return true;
    }
    
    return !ignore.some(function (ig) {
      return ig.test(s);
    })
  });
  
};

export const onceAsync = function (ctx: Object, fn: Function): Function {
  
  let callable = true;
  return function callOnce(err: Error) {
    const args = Array.from(arguments);
    if (callable) {
      callable = false;
      process.nextTick(function () {
        fn.apply(ctx, args);
      });
    }
    else {
      log.warning('warning: function was called more than once -' + fn ? fn.toString() : '');
      if (err) {
        log.error('warning: ', err.stack || util.inspect(err));
      }
    }
    
  }
};

export const customStringify = function (v: any) {
  const cache = new Map();
  return JSON.stringify(v, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.get(value)) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.set(value, true);
    }
    return value;
  });
};

export const makePathExecutable = function (runPath: string, cb: ErrnoExceptionType) {
  
  if (runPath) {
    fs.chmod(runPath, 0o777, cb);
  }
  else {
    process.nextTick(cb);
  }
};

export const checkForEquality = function (arr1: Array<string>, arr2: Array<string>): boolean {
  
  if (arr1.length !== arr2.length) {
    return false;
  }
  
  arr1 = arr1.sort();
  arr2 = arr2.sort();
  
  for (let i = 0; i < arr1.length; i++) {
    if (String(arr1[i]) !== String(arr2[i])) {
      return false;
    }
  }
  
  return true;
};

export const arrayHasDuplicates = function (a: Array<any>): boolean {
  return !a.every(function (item, i) {
    return a.indexOf(item) === i;
  });
};

export const isStringWithPositiveLn = function (s: string) {
  return typeof s === 'string' && s.length > 0;
};

export const findNearestRunAndTransform = function (root: string, pth: string, cb: Function) {
  
  try {
    if (!fs.statSync(pth).isDirectory()) {
      pth = path.dirname(pth);
    }
  }
  catch (err) {
    return process.nextTick(cb, err);
  }
  
  let results: Array<any> = [];
  let upPath: string = pth;
  
  async.whilst(function () {
      
      return upPath.length >= root.length;
      
    }, function (cb: Function) {
      
      async.parallel({
        
        run: function (cb: Function) {
          let p = path.resolve(upPath + '/@run.sh');
          fs.stat(p, function (err, stats) {
            let z = (stats && stats.isFile()) ? {run: p} : undefined;
            // z && results.push(z);
            z && results.unshift(z);
            cb();
          });
        },
        
        transform: function (cb: Function) {
          let p = path.resolve(upPath + '/@transform.sh');
          fs.stat(p, function (err, stats) {
            let z = (stats && stats.isFile()) ? {transform: p} : undefined;
            // z && results.push(z);
            z && results.unshift(z);
            cb();
          });
        },
        
        config: function (cb: Function) {
          let p = path.resolve(upPath + '/@config.json');
          fs.stat(p, function (err, stats) {
            let z = (stats && stats.isFile()) ? {config: p} : undefined;
            // z && results.push(z);
            z && results.unshift(z);
            cb();
          });
        }
        
      }, function (err: Error) {
        upPath = path.resolve(upPath + '/../');
        cb(err);
      });
      
    },
    
    function (err: Error) {
      if (err) {
        return cb(err);
      }
      
      let ret: INearestRunAndTransformRet = results.reduce(function (prev, curr) {
        return (curr ? Object.assign(prev, curr) : prev);
      }, {});
      
      cb(null, ret);
      
    });
  
};

export const findSumanMarkers = function (types: Array<string>, root: string, files: Array<string>, cb: IMapCallback): void {
  
  //TODO: we can stop when we get to the end of all the files in files array
  const sumanHelpersDirRegex = new RegExp(_suman.sumanHelperDirRoot);
  const map: any = {};
  
  let addItem = function (item: string): void {
    let filename = path.basename(item);
    types.forEach(function (t) {
      if (filename === t) {
        if (!map[path.dirname(item)]) {
          map[path.dirname(item)] = {};
        }
        map[path.dirname(item)][t] = true;
      }
    });
  };
  
  (function getMarkers(dir: string, cb: ErrorCallback<any>) {
    
    if (sumanHelpersDirRegex.test(dir)) {
      return process.nextTick(cb);
    }
    
    fs.readdir(dir, function (err, items) {
      
      if (err) {
        log.warning('warning: fs error while creating suman markers map.');
        log.warning('warning: ' + err.message);
        return cb(null);
      }
      
      items = items.map(function (item) {
        return path.resolve(dir, item);
      });
      
      async.eachLimit(items as any, 5, function (item: string, cb: ErrorCallback<any>) {
        
        if (sumanHelpersDirRegex.test(item)) {
          return process.nextTick(cb);
        }
        
        fs.stat(item, function (err, stats) {
          
          if (err) {
            log.warning('warning: fs error while creating suman markers map.');
            log.warning('warning:' + err.message);
            return cb(null);
          }
          
          if (stats.isFile()) {
            addItem(item);
            cb(null);
          }
          else if (stats.isDirectory()) {
            //TODO: stop here if this item is deeper than any of the files passed in
            if (!/node_modules/.test(String(item)) && !/\/.git\//.test(String(item))) {
              addItem(item);
              getMarkers(item, cb);
            }
            else {
              log.warning(`warning: node_modules/.git path ignored => "${item}".`);
              cb(null);
            }
          }
          else {
            log.warning('warning: fs error while creating suman markers map.');
            log.warning(`warning: not directory or file => "${item}".`);
            log.warning(`warning: possibly a symlink (symlinks not yet supported) => "${item}".`);
            cb(null);
          }
          
        });
        
      }, cb);
      
    });
    
  })
  (root, function (err: Error) {
    
    err ? cb(err) : cb(null, map);
    
  });
  
};

export const isObject = function (v: any) {
  return v && typeof v === 'object' && !Array.isArray(v);
};





