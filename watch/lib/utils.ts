'use strict';

//dts
import {ISumanOpts, ISumanConfig} from 'suman-types/dts/global';
import {IMap} from "suman-types/dts/suman-utils";
import {AsyncResultArrayCallback} from 'async';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import util = require('util');
import assert = require('assert');
import path = require('path');
import * as EE from 'events';
import fs = require('fs');
import * as stream from 'stream';

//npm
import log from './logging';
import chalk = require('chalk');
import * as async from 'async';
import * as su from 'suman-utils';
const picomatch = require('picomatch');

/////////////////////////////////////////////////////////////////////////////////////////

export const getAlwaysIgnore = function () {

  return [

    '.DS_Store',
    '/.idea/',
    '___jb_old___',
    '___jb_tmp___',
    '/node_modules/',
    '/.git/',
    '\\.log$',
    '/logs/',
    '/@target/',
    '\.txt$'

  ];

};

const normalizeGlobPath = function (value: string) {
  return value.replace(/\\/g, '/');
};

const addUnique = function (values: Array<string>, value: string) {
  if (values.indexOf(value) < 0) {
    values.push(value);
  }
};

const testRegExp = function (regex: RegExp, value: string) {
  regex.lastIndex = 0;
  return regex.test(value);
};

export const getChokidarWatchPlan = function (includes: Array<string | RegExp>, cwd?: string) {

  const root = path.resolve(cwd || process.cwd());
  const watchPaths: Array<string> = [];
  const positiveMatchers: Array<(filePath: string) => boolean> = [];
  const negativeMatchers: Array<(filePath: string) => boolean> = [];

  includes.forEach(function (include: string | RegExp) {

    if (include instanceof RegExp) {
      addUnique(watchPaths, '.');
      positiveMatchers.push(function (filePath: string) {
        const absolutePath = path.resolve(root, filePath);
        const relativePath = path.relative(root, absolutePath);
        return testRegExp(include, filePath) ||
          testRegExp(include, relativePath) ||
          testRegExp(include, absolutePath);
      });
      return;
    }

    const normalizedPattern = normalizeGlobPath(include);
    const scan = picomatch.scan(normalizedPattern);

    if (!scan.isGlob) {
      addUnique(watchPaths, include);
      const literalPath = path.resolve(root, include);
      positiveMatchers.push(function (filePath: string) {
        const absolutePath = path.resolve(root, filePath);
        return absolutePath === literalPath || absolutePath.indexOf(literalPath + path.sep) === 0;
      });
      return;
    }

    let matcherPattern = scan.negated ? normalizedPattern.substring(scan.start) : normalizedPattern;
    if (!path.isAbsolute(include) && matcherPattern.indexOf('./') === 0) {
      matcherPattern = matcherPattern.substring(2);
    }

    const matcher = picomatch(matcherPattern);
    const matchesGlob = function (filePath: string) {
      const absolutePath = path.resolve(root, filePath);
      const relativePath = normalizeGlobPath(path.relative(root, absolutePath));
      return matcher(path.isAbsolute(include) ? normalizeGlobPath(absolutePath) : relativePath);
    };

    if (scan.negated) {
      negativeMatchers.push(matchesGlob);
    }
    else {
      addUnique(watchPaths, scan.base || '.');
      positiveMatchers.push(matchesGlob);
    }
  });

  if (watchPaths.length < 1) {
    watchPaths.push('.');
  }

  const isIncluded = function (filePath: string) {
    const hasPositiveMatch = positiveMatchers.length < 1 ||
      positiveMatchers.some(function (matcher: (filePath: string) => boolean) {
        return matcher(filePath);
      });

    return hasPositiveMatch && !negativeMatchers.some(function (matcher: (filePath: string) => boolean) {
      return matcher(filePath);
    });
  };

  return {
    paths: watchPaths,
    isIncluded,
    ignored: function (filePath: string, stats?: fs.Stats) {
      return Boolean(stats && stats.isFile() && !isIncluded(filePath));
    }
  };
};

const sig = ['@run.sh', '@transform.sh', '@config.json', 'suman.conf.js'];

export const isPathMatchesSig = function (basename: string) {
  return sig.some(function (v: string) {
    return String(basename) === String(v);
  });
};

export const getWatchObj = function (projectRoot: string, sumanOpts: ISumanOpts, sumanConfig?: ISumanConfig) {

  if (!sumanConfig) {
    // we should re-load suman config, in case it has changed, etc.
    const p = path.resolve(projectRoot + '/suman.conf.js');
    log.warning(`new suman.conf.js path => ${p}`);
    delete require.cache[p];
    log.warning(`deleted suman.conf.js cache`);
    sumanConfig = require(p);
    log.warning(`re-required suman.conf.js file.`);
  }

  let watchObj = null;

  if (sumanOpts.watch_per) {
    assert(su.isObject(sumanConfig.watch),
      chalk.red(' => Suman usage error => suman.conf.js needs a "watch" property that is an object.'));

    assert(su.isObject(sumanConfig.watch.per),
      chalk.red(' => Suman usage error => suman.conf.js "watch" object, needs property called "per" that is an object.'));

    watchObj = sumanConfig.watch.per[sumanOpts.watch_per];

    assert(su.isObject(watchObj),
      chalk.red(`Suman usage error => key "${sumanOpts.watch_per}" does not exist on the {suman.conf.js}.watch.per object.`));
  }

  return {
    watchObj,
    sumanConfig
  };

};

export const find = function (getTransformPaths: IMap, cb: AsyncResultArrayCallback<Error, Iterable<any>>) {

  async.map(Object.keys(getTransformPaths), function (key, cb: Function) {

    if (!getTransformPaths[key]['@config.json']) {
      return process.nextTick(cb);
    }

    const p = path.resolve(key + '/@config.json');

    fs.readFile(p, 'utf8', function (err: Error, data: string) {

      if (err) {
        return cb(err);
      }

      try {
        cb(null, {path: p, data: JSON.parse(data)});
      }
      catch (err) {
        cb(err);
      }

    });

  }, cb)

};

const $exports = module.exports;
export default $exports;
