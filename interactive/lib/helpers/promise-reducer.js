'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const util = require('util');

//npm
const su = require('suman-utils');

//project
const _suman = global.__suman = (global.__suman || {});
const interactive = _suman.interactive = _suman.interactive || {};
const {log} = require('../logging');

/////////////////////////////////////////////////////////////////////

module.exports = function (run, opts, cb, fns, completeFns) {

  const makeRunCB = function (obj) {

    return _suman.backspacingFn = function () {

      _suman.backspacing = true;

      let fn;
      if (completeFns.length < 1) {
        fn = cb;
      }
      else {
        fn = run.bind(null, obj, cb);
      }
      const s2 = completeFns.shift();
      if (s2) {
        fns.unshift(s2);
      }
      fn();
    }

  };

  return fns.reduce(function (prev, curr, index) {

    return prev.then(function (obj) {

      if (String(obj) === 'backspacing') {
        return Promise.reject('backspacing');
      }

      const runCB = makeRunCB(obj);

      if (index > 0) {

        const s1 = fns.shift();
        if (!s1) {
          throw new Error(' => Suman interactive implementation error.');
        }
        completeFns.unshift(s1);
      }

      return curr(obj, runCB);

    });

  }, Promise.resolve(opts)).catch(function (e) {
    if (!String(e.stack || e).match(/backspacing/)) {
      console.warn('NON BACKSPACING ERROR 2 => ', e.stack || e);
      throw new Error(e.stack || e);
    }
    else{
      throw new Error('backspacing');
    }

  });

};
