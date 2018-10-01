#!/usr/bin/env ts-node
'use strict';

import {IRet, IExpectedCounts} from "suman-types/dts/reporters";

//core
import EE = require('events');
import fs = require('fs');
import path = require('path');
import assert = require('assert');

//npm
import su = require('suman-utils');

// import all reporters, just for a smoke test
import clearLineReporter from '../modules/clear-line-reporter';
import karmaReporter from '../modules/karma-reporter';
import metaTestReporter from '../modules/meta-test-reporter';
import stdReporter from '../modules/std-reporter';
import tapJSONReporter from '../modules/tap-json-reporter';
import tapReporter from '../modules/tap-reporter';
import webSocketReporter from '../modules/websocket-reporter';

global.__karma__ = {}; // make the karma test pass..

const e = new EE();
const suman = require('suman');
const {Test} = suman.init(module);

const _suman = global.__suman;
const sumanOpts = _suman.sumanOpts;

const util = require('util');
// console.log('_suman',util.inspect(_suman));
// console.log('sumanOpts',util.inspect(sumanOpts));



Test.create(function (it) {
  
  ////////

  [
    clearLineReporter(e, {} as any),
    karmaReporter(e, {} as any),
    metaTestReporter(e, {} as any, {} as IExpectedCounts),
    stdReporter(e, {} as any),
    tapJSONReporter(e, {} as any),
    tapReporter(e, {} as any),
    webSocketReporter(e, {} as any)
  ]
  .forEach(function (ret: IRet, index: number) {

    it(`tests return value signature, reporterName: ${ret && ret.reporterName}`, t => {
      assert(su.isObject(ret));
      assert.equal(typeof ret.reporterName, 'string', 'reporter return value does not include a "reporterName" property.');
    });
  });

  it('test counts', {},
    t => {

      const reportersRoot = path.resolve(__dirname + '/../modules');

      const items = fs.readdirSync(reportersRoot).filter(function (item) {
        return fs.statSync(path.resolve(reportersRoot + '/' + item)).isDirectory();
      });

      // we should assert that items length is the same number as the number of loaded reporters
      console.log('items.length => ', items.length);

    });

});


