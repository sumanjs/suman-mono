'use strict';
import {IGlobalSumanObj} from "suman-types/dts/global";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import fs = require('fs');
import path = require('path');
import util = require('util');
import assert = require('assert');
import EE = require('events');
import cp = require('child_process');

//npm
const includes = require('lodash.includes');

//project
const _suman : IGlobalSumanObj = global.__suman = (global.__suman || {});
import su = require('suman-utils');

///////////////////////////////////////////////

export const run  = order => {

  const cwd = process.cwd();
  const projectRoot = _suman.projectRoot = (_suman.projectRoot || su.findProjectRoot(cwd));
  const uniqueTestPaths : Array<string> = [];

  try {
    order = JSON.parse(JSON.stringify(order));
  }
  catch (err) {
    throw new Error(' => Suman fatal error => Suman could not stringify/parse your suman.order.js exported object.');
  }

  assert(typeof order === 'object', ' => Suman fatal error => your suman.order.js file does not export a function that returns an object.');

  const keys = Object.keys(order);

  Object.keys(order).forEach(function (key, index) {

    const val = order[key];
    assert(typeof val.testPath === 'string' && val.testPath.length > 0, ' => Suman fatal error => ' +
      'invalid testPath at key = "' + key + '" in your suman.order.js file.');

    if (path.isAbsolute(val.testPath)) {
      throw new Error(' => Suman fatal error => ' +
        'invalid "testPath" object property at key = "' + key + '" in your suman.order.js file => please only use relative paths from the root of your project.');
    }

    if (includes(uniqueTestPaths, val.testPath)) {
      throw new Error(' => Suman usage error => "testPath" property with value => "' + val.testPath + '"' +
        ' appears twice in your suman.order.js file,' +
        ' for the second time at key = "' + key + '"');
    }
    else {
      uniqueTestPaths.push(val.testPath);
    }

    if (val.obstructs) {
      assert(Array.isArray(val.obstructs), '=> Suman fatal error => invalid obstructs value at key = "' + key + '" in your suman.order.js file.');

      if (su.arrayHasDuplicates(val.obstructs)) {
        throw new Error(' => Suman fatal error => obstructs array in suman.order.js belonging to key = "' + key + '" contains duplicate values.');
      }

      val.obstructs.forEach(function ($key) {
        if (String(key) === String($key)) {
          throw new Error(' => Suman fatal error => suman.order.js has a key = "' + key + '" that will obstruct itself from running.');
        }

        if (!includes(keys, String($key))) {
          throw new Error(' => Suman fatal error => Key given by value = "' + $key + '" was not present in your suman.order.js file.');
        }
      });
    }
    else {
      val.obstructs = [];  //assign the array for ease of use later
    }

  });

};
