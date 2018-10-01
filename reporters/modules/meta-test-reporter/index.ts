'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import EventEmitter = NodeJS.EventEmitter;
import {IRet, IRetContainer, IExpectedCounts, IResultsObj} from 'suman-types/dts/reporters';
import {ITestDataObj} from "suman-types/dts/it";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';
import su = require('suman-utils');

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {events} from 'suman-events';
import isEqual = require('lodash.isequal');
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);
const noColors = process.argv.indexOf('--no-color') > 0;

/////////////////////////////////////////////////////////////////////////////////////////

export const loadreporter = wrapReporter(reporterName, (retContainer: IRetContainer, results: IResultsObj, s: EventEmitter,
                                                        sumanOpts: ISumanOpts, expectations: IExpectedCounts) => {

  s.on(String(events.TEST_CASE_PASS), function (test: ITestDataObj) {
    results.passes++;
  });

  s.on(String(events.TEST_CASE_FAIL), function (test: ITestDataObj) {
    results.failures++;
  });

  s.on(String(events.TEST_CASE_SKIPPED), function (test: ITestDataObj) {
    results.skipped++;
  });

  s.on(String(events.TEST_CASE_STUBBED), function (test: ITestDataObj) {
    results.stubbed++;
  });

  s.on(String(events.META_TEST_ENDED), function (test: ITestDataObj) {

    log.info('Suman "META_TEST_ENDED" event ', test);

    try {
      assert(isEqual(results, expectations), 'expectations and results are not equal.');
      log.veryGood('Suman "meta-test-reporter" has passed its primary test. Good news.');
    }
    catch (err) {
      console.error(err.stack || err);
      process.exit(1);
    }

  });

  return retContainer.ret = <IRet>{
    results,
    reporterName
  };

});

export default loadreporter;


