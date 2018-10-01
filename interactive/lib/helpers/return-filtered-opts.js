'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const assert = require('assert');
const util = require('util');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

//npm
const async = require('async');
const colors = require('colors/safe');
const su = require('suman-utils');

//project
const _suman = global.__suman = (global.__suman || {});
const interactive = _suman.interactive = _suman.interactive || {};
const {log} = require('../logging');

////////////////////////////////////////////////////////////////////////////////////

module.exports = function (optsList) {

  const sumanOptions = _suman.allSumanOptions;

  return sumanOptions.filter(function (item) {

    const n = item.name || item.names[ 0 ];
    return optsList.indexOf(n) > -1;

  }).map(function (item) {

    const n = item.name || item.names[ 0 ];

    return {
      name: '--' + n + ', [type = ' + item.type + '], (' + item.help + ')',
      value: '--' + n,
      checked: false
    }

  });
};
