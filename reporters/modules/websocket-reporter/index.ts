'use strict';
//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import {IRet, IRetContainer, IExpectedCounts, IResultsObj} from 'suman-types/dts/reporters';
import EventEmitter = NodeJS.EventEmitter;
import {ITestDataObj} from "suman-types/dts/it";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';

//npm
const {events} = require('suman-events');
import * as chalk from 'chalk';
import su = require('suman-utils');

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);

//////////////////////////////////////////////////////////////////////////////////////

export const loadReporter = wrapReporter(reporterName, (retContainer: IRetContainer, results: IResultsObj, s: EventEmitter,
                                                        opts: ISumanOpts, expectations: {}, client: SocketIOClient.Socket) => {

  const runAsync = function (fn: Function) {
    retContainer.ret.count++;
    fn(function (err: Error) {
      err && log.error(err.stack || err);
      retContainer.ret.count--;
      if (retContainer.ret.count < 1) {
        // ret.cb starts off as a noop, but the suman framework
        // will reassign the value in the future and it will signal that we are done
        retContainer.ret.cb && retContainer.ret.cb();
      }
    });
  };

  s.on(events.RUNNER_STARTED, function () {
    log.info('Suman runner has started.\n');
  });

  s.on(events.RUNNER_ENDED, function () {
    console.log('# tests ' + (results.n));
    console.log('# pass ' + results.passes);
    console.log('# fail ' + results.failures);
    console.log('# stubbed ' + results.stubbed);
    console.log('# skipped ' + results.skipped);
  });

  s.on(events.TEST_CASE_END, function (test: ITestDataObj) {
    ++results.n;
  });

  s.on(events.TEST_CASE_FAIL, function (test: ITestDataObj) {
    results.failures++;
    runAsync(function (cb: Function) {
      const str = su.customStringify({
        childId: process.env.SUMAN_CHILD_ID,
        test,
        type: 'LOG_RESULT',
      });
      client.emit('LOG_RESULT', JSON.parse(str), cb);
    });
  });

  s.on(events.TEST_CASE_PASS, function (test: ITestDataObj) {
    results.passes++;
    runAsync(function (cb: Function) {
      const str = su.customStringify({
        childId: process.env.SUMAN_CHILD_ID,
        test,
        type: 'LOG_RESULT',
      });
      client.emit('LOG_RESULT', JSON.parse(str), cb);
    });
  });

  s.on(events.TEST_CASE_SKIPPED, function (test: ITestDataObj) {
    results.skipped++;
    runAsync(function (cb: Function) {
      const str = su.customStringify({
        childId: process.env.SUMAN_CHILD_ID,
        test,
        type: 'LOG_RESULT',
      });
      client.emit('LOG_RESULT', JSON.parse(str), cb);
    });
  });

  s.on(events.TEST_CASE_STUBBED, function (test: ITestDataObj) {
    results.stubbed++;
    runAsync(function (cb: Function) {
      const str = su.customStringify({
        childId: process.env.SUMAN_CHILD_ID,
        test,
        type: 'LOG_RESULT',
      });
      client.emit('LOG_RESULT', JSON.parse(str), cb);
    });
  });

  return retContainer.ret = <IRet>{
    results,
    reporterName,
    count: 0,
    cb: null
  };

});

export default loadReporter;
