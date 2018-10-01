'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import {ITestDataObj} from "suman-types/dts/it";
import EventEmitter = NodeJS.EventEmitter;
import {ITestSuite} from 'suman-types/dts/test-suite';
import {IRet, IRetContainer, IExpectedCounts, IResultsObj, ITAPJSONTestCase} from 'suman-types/dts/reporters';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';

//npm
import chalk = require('chalk');
import {events} from 'suman-events';
import su =  require('suman-utils');
import stdio = require('json-stdio');

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);

///////////////////////////////////////////////////////////

function title(test: ITestDataObj) {
  return String(test.title || test.desc || test.description || test.name).replace(/#/g, '').trim();
}

//////////////////////////////////////////////////////////

const logDebug = function () {
  let debug;
  if (debug = process.env.SUMAN_DEBUG) {
    const args = Array.from(arguments).filter(i => i);
    args.forEach(function (a) {
      process.stderr.write('\n' + (typeof a === 'string' ? a : util.inspect(a)) + '\n');
    });
  }
  return debug;
};

interface IStringVarargs {
  (...args: string[]): void;
}

let onAnyEvent: IStringVarargs = function () {
  if (!logDebug.apply(null, arguments)) {
    const args = Array.from(arguments).map(function (data) {
      return typeof data === 'string' ? data : util.inspect(data);
    });
    return console.log.apply(console, args);
  }
};

let getTestFilePath = function (test: ITestDataObj) {
  return String(test.testPath || test.filePath || test.filepath || test.testpath).trim();
};

let getTestDesc = function (test: ITestDataObj) {
  return String(test.desc || test.title || test.name).trim();
};

////////////////////////////////////////////////////////////////////////////////////////

let isTTY = process.stdout.isTTY;

////////////////////////////////////////////////////////////////////////////////////////

export const loadReporter = wrapReporter(reporterName, (retContainer: IRetContainer, results: IResultsObj,
                                                        s: EventEmitter, sumanOpts: ISumanOpts) => {

  if (_suman.inceptionLevel < 1 && !isTTY) {
    log.warning(`"${reporterName}" warning: suman inception level is 0, we may not need to load this reporter.`);
  }

  let isColorable = function (): boolean {
    return _suman.inceptionLevel < 1 && !sumanOpts.no_color;
  };

  let getPaddingCount = function () {
    return _suman.currentPaddingCount ? _suman.currentPaddingCount.val || 0 : 0
  };

  let getTAPJSONType = function (eventName: string): string {
    return String(eventName) + '_TAP_JSON';
  };


  s.on(String(events.TEST_CASE_END_TAP_JSON), function (d: ITAPJSONTestCase) {
    results.n++;
    // console.error('TEST_CASE_END_TAP_JSON',d);
    // d.messageType = String(events.TEST_CASE_END_TAP_JSON);
    stdio.logToStdout(d);
  });

  s.on(String(events.TEST_CASE_FAIL_TAP_JSON), function (d: ITAPJSONTestCase) {
    results.failures++;
    stdio.logToStdout(d);
    // const test = d.testCase;
    // console.log(su.customStringify({
    //   '@tap-json': true,
    //   ok: false,
    //   desc: getTestDesc(test),
    //   filePath: getTestFilePath(test),
    //   error: test.errorDisplay || test.error,
    //   id: results.n,
    //   dateComplete: test.dateComplete,
    //   dateStarted: test.dateStarted
    // }));
  });

  s.on(String(events.TEST_CASE_PASS_TAP_JSON), function (d: ITAPJSONTestCase) {
    results.passes++;
    // console.error('TEST_CASE_PASS_TAP_JSON',d);
    stdio.logToStdout(d);
    // const test = d.testCase;
    // console.log(su.customStringify({
    //   '@tap-json': true,
    //   ok: true,
    //   desc: getTestDesc(test),
    //   filePath: getTestFilePath(test),
    //   id: results.n,
    //   dateComplete: test.dateComplete,
    //   dateStarted: test.dateStarted
    // }));
  });

  s.on(String(events.TEST_CASE_SKIPPED_TAP_JSON), function (d: ITAPJSONTestCase) {
    results.skipped++;
    stdio.logToStdout(d);
    // const test = d.testCase;
    // console.log(su.customStringify({
    //   '@tap-json': true,
    //   ok: true,
    //   desc: getTestDesc(test),
    //   filePath: getTestFilePath(test),
    //   id: results.n,
    //   skipped: true,
    //   skip: true,
    //   dateComplete: test.dateComplete,
    //   dateStarted: test.dateStarted
    // }));
  });

  s.on(String(events.TEST_CASE_STUBBED_TAP_JSON), function (d: ITAPJSONTestCase) {
    results.stubbed++;
    stdio.logToStdout(d);
    // const test = d.testCase;
    // console.log(su.customStringify({
    //   '@tap-json': true,
    //   ok: true,
    //   desc: getTestDesc(test),
    //   filePath: getTestFilePath(test),
    //   id: results.n,
    //   stubbed: true,
    //   todo: true,
    //   dateComplete: test.dateComplete,
    //   dateStarted: test.dateStarted
    // }));
  });

  {
    let evn = String(events.SUMAN_CONTEXT_BLOCK);
    s.on(evn, function (b: ITestSuite) {
      stdio.logToStdout({
        messageType: getTAPJSONType(evn),
        padding: getPaddingCount(),
        message: ` ▶ group: '${b.desc}' ▶ `
      });
    });
  }

  {
    let evn = String(events.TEST_CASE_END);
    s.on(evn, function (b: ITestSuite) {
      results.n++;
      stdio.logToStdout({
        messageType: getTAPJSONType(evn),
      });
    });
  }

  {
    let evn = String(events.TEST_CASE_FAIL);
    s.on(evn, function (test: ITestDataObj) {
      results.failures++;
      console.log(su.customStringify({
        '@tap-json': true,
        '@json-stdio': true,
        messageType: getTAPJSONType(evn),
        padding: getPaddingCount(),
        testCase: {
          ok: false,
          desc: getTestDesc(test),
          filePath: getTestFilePath(test),
          error: test.errorDisplay || test.error,
          id: results.n,
          dateComplete: test.dateComplete,
          dateStarted: test.dateStarted
        }
      }));
    });
  }

  {
    let evn = String(events.TEST_CASE_PASS);
    s.on(evn, function (test: ITestDataObj) {
      results.passes++;
      console.log(su.customStringify({
        '@tap-json': true,
        '@json-stdio': true,
        messageType: getTAPJSONType(evn),
        padding: getPaddingCount(),
        testCase: {
          ok: true,
          desc: getTestDesc(test),
          filePath: getTestFilePath(test),
          id: results.n,
          dateComplete: test.dateComplete,
          dateStarted: test.dateStarted
        }
      }));
    });
  }

  {
    let evn = String(events.TEST_CASE_SKIPPED);
    s.on(evn, function (test: ITestDataObj) {
      results.skipped++;
      console.log(su.customStringify({
        '@tap-json': true,
        '@json-stdio': true,
        messageType: getTAPJSONType(evn),
        padding: getPaddingCount(),
        testCase: {
          ok: true,
          desc: getTestDesc(test),
          filePath: getTestFilePath(test),
          id: results.n,
          skipped: true,
          skip: true,
          dateComplete: test.dateComplete,
          dateStarted: test.dateStarted
        }
      }));
    });
  }

  {

    let evn = String(events.TEST_CASE_STUBBED);
    s.on(evn, function (test: ITestDataObj) {
      results.stubbed++;
      console.log(su.customStringify({
        '@tap-json': true,
        '@json-stdio': true,
        padding: getPaddingCount(),
        messageType: getTAPJSONType(evn),
        testCase: {
          ok: true,
          desc: getTestDesc(test),
          filePath: getTestFilePath(test),
          id: results.n,
          stubbed: true,
          todo: true,
          dateComplete: test.dateComplete,
          dateStarted: test.dateStarted
        }
      }));
    });

  }

  return retContainer.ret = <IRet>{
    reporterName,
    results
  };

});

export default loadReporter;
