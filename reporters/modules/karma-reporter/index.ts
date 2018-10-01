'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import EventEmitter = NodeJS.EventEmitter;
import {ITestDataObj} from "suman-types/dts/it";
import {ISumanChildProcess} from "suman-types/dts/runner";
import {ITableData} from "suman-types/dts/table-data";
import {IRet, IRetContainer, IResultsObj, IExpectedCounts} from 'suman-types/dts/reporters';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';

//npm
import su = require("suman-utils");
import * as chalk from 'chalk';

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {events} from 'suman-events';
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);
const noColors = process.argv.indexOf('--no-color') > 0;
const noop = function () {};

//////////////////////////////////////////////////////////////////////////////////////////////

export const loadReporter = wrapReporter(reporterName,
  (retContainer: IRetContainer, results: IResultsObj, s: EventEmitter, sumanOpts: ISumanOpts) => {
  
  
  const karma = global.__karma__;
  assert(karma, 'karma object not exposed at global.__karma___ or window.__karma__');

  /*

   // object passed to result(obj);

    {
      // test id
      id: String,

        // test description
        description: String,

      // the suite to which this test belongs. potentially nested.
      suite: Array[String],

      // an array of string error messages that might explain a failure.
      // this is required if success is false.
      log: Array[String],

      success: Boolean, // pass / fail

      skipped: Boolean // skipped / ran
    }

  */

  //on error
  s.on(String(events.RUNNER_EXIT_CODE_GREATER_THAN_ZERO), noop);

  s.on(String(events.FATAL_TEST_ERROR), function (err: any) {
    log.error('fatal runtime error, suman tests cannot continue:\n', err && (err.stack || util.inspect(err)));
  });

  s.on(String(events.TEST_CASE_END), function () {
    ++results.n;
  });

  s.on(String(events.TEST_CASE_FAIL), function (test: ITestDataObj) {
    ++results.failures;
    karma.result({
      id: String(test.testId),
      skipped: false,
      success: false,
      description: test.desc,
      log: [],
      suite: []
    });
  });

  s.on(String(events.TEST_CASE_PASS), function (test: ITestDataObj) {
    ++results.passes;
    let timeDiffStr = (test.dateComplete ? '(' + ((test.dateComplete - test.dateStarted) || '< 1') + 'ms)' : '');
    karma.result({
      id: String(test.testId),
      skipped: false,
      success: true,
      description: test.desc,
      log: [],
      suite: []
    });
  });

  s.on(String(events.TEST_CASE_SKIPPED), function (test: ITestDataObj) {
    ++results.skipped;
    karma.result({
      id: String(test.testId),
      skipped: true,
      success: false,
      description: test.desc,
      log: [],
      suite: []
    });
  });

  s.on(String(events.TEST_CASE_STUBBED), function (test: ITestDataObj) {
    ++results.stubbed;
    karma.result({
      id: String(test.testId),
      skipped: true,
      success: false,
      description: test.desc,
      log: [],
      suite: []
    });
  });

  // setTimeout(function(){
  //   karma.complete();
  // }, 3000);

  return retContainer.ret = <IRet>{
    results,
    reporterName,
    count: 0,
    cb: noop,
    completionHook: function () {
      log.veryGood('calling karma.complete()...');
      karma.info({total: results.n});
      karma.complete({total: results.n});
    }
  };

});

export default loadReporter;
