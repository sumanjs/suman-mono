'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import EventEmitter = NodeJS.EventEmitter;
import {IRet, IRetContainer, IExpectedCounts, IResultsObj, ITAPJSONTestCase} from 'suman-types/dts/reporters';
import {ITestDataObj} from "suman-types/dts/it";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';

//npm
import su = require('suman-utils');
import chalk = require('chalk');
import {events} from 'suman-events';

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);

///////////////////////////////////////////////////////////

function getCleanTitle(test: ITestDataObj) {
  return String(test.title || test.desc || test.description || test.name).replace(/#/g, '').trim();
}


function logDebug() {
  let debug;
  if (debug = process.env.SUMAN_DEBUG) {
    const args = Array.from(arguments).filter(i => i);
    args.forEach(function (a) {
      process.stderr.write('\n' + (typeof a === 'string' ? a : util.inspect(a)) + '\n');
    });
  }
  return debug;
}

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

/////////////////////////////////////////////////////////////////////////////////////

let isTTY = process.stdout.isTTY;

////////////////////////////////////////////////////////////////////////////////////////

export const loadreporter = wrapReporter(reporterName, (retContainer: IRetContainer, results: IResultsObj,
                                                        s: EventEmitter, sumanOpts: ISumanOpts) => {
  
  if (_suman.inceptionLevel < 1 && !isTTY) {
    log.warning(`"${reporterName}" warning: suman inception level is 0, we may not need to load this reporter.`);
  }
  
  let isColorable = function (): boolean {
    return _suman.inceptionLevel < 1 && !sumanOpts.no_color;
  };
  
  s.on(String(events.RUNNER_INITIAL_SET), function (forkedCPs: Array<any>, processes: string, suites: string) {
    onAnyEvent('\n\n\t ' + chalk.bgBlue.yellow(' => [Suman runner] =>  initial set => ' +
      forkedCPs.length + ' ' + processes + ' running ' + forkedCPs.length + ' ' + suites + ' ') + '\n');
  });
  
  s.on(String(events.RUNNER_OVERALL_SET), function (totalCount: number, processes: string, suites: string, addendum: string) {
    onAnyEvent('\t ' + chalk.bgBlue.yellow(' => [Suman runner] =>  overall set => '
      + totalCount + ' ' + processes + ' will run ' + totalCount + ' ' + (suites + addendum) + ' ') + '\n\n\n');
  });
  
  s.on(String(events.RUNNER_ASCII_LOGO), function (logo: string) {
    onAnyEvent('\n\n' + logo + '\n\n')
  });
  
  s.on(String(events.RUNNER_STARTED), function () {
    _suman.log.info('Suman runner has started.');
  });
  
  s.on(String(events.RUNNER_ENDED), function () {
    console.log('# tests ' + (results.passes + results.failures));
    console.log('# pass ' + results.passes);
    console.log('# fail ' + results.failures);
    console.log('# stubbed ' + results.failures);
    console.log('# skipped ' + results.failures);
  });
  
  s.on(String(events.TAP_COMPLETE), function (data) {
    if(su.vgt(6)){
      log.info('All TAP input received.');
    }
  });
  
  let onTestCaseEnd = function () {
    results.n++;
  };
  
  let onTestCaseFail = function (test: ITestDataObj | ITAPJSONTestCase) {
    test = test.testCase || test;
    results.failures++;
    if (false && isColorable()) {
      console.log(chalk.red(`not ok ${results.n} ${getCleanTitle(test)}`));
    }
    else {
      console.log(`not ok ${results.n} ${getCleanTitle(test)}`);
    }
  };
  
  let onTestCasePass = function (test: ITestDataObj | ITAPJSONTestCase) {
    test = test.testCase || test;
    results.passes++;
    if (false && isColorable()) {
      console.log(chalk.green(`ok ${results.n} ${getCleanTitle(test)}`));
    }
    else {
      console.log(`ok ${results.n} ${getCleanTitle(test)}`);
    }
  };
  
  let onTestCaseSkipped = function (test: ITestDataObj) {
    test = test.testCase || test;
    results.skipped++;
    console.log('ok %d %s # SKIP -', results.n, getCleanTitle(test));
  };
  
  let onTestCaseStubbed = function (test: ITestDataObj) {
    test = test.testCase || test;
    results.stubbed++;
    console.log('ok %d %s # STUBBED -', results.n, getCleanTitle(test));
  };
  
  s.on(String(events.TEST_CASE_END_TAP_JSON), onTestCaseEnd);
  s.on(String(events.TEST_CASE_END), onTestCaseEnd);
  
  s.on(String(events.TEST_CASE_FAIL_TAP_JSON), onTestCaseFail);
  s.on(String(events.TEST_CASE_FAIL), onTestCaseFail);
  
  s.on(String(events.TEST_CASE_PASS_TAP_JSON), onTestCasePass);
  s.on(String(events.TEST_CASE_PASS), onTestCasePass);
  
  s.on(String(events.TEST_CASE_SKIPPED_TAP_JSON), onTestCaseSkipped);
  s.on(String(events.TEST_CASE_SKIPPED), onTestCaseSkipped);
  
  s.on(String(events.TEST_CASE_STUBBED_TAP_JSON), onTestCaseStubbed);
  s.on(String(events.TEST_CASE_STUBBED), onTestCaseStubbed);

  
  s.on(String(events.RUNNER_EXIT_CODE), function (code: number) {
    onAnyEvent(['\n  ',
      ' <::::::::::::::::::::::::::::::::: Suman runner exiting with exit code: ' + code +
      ' :::::::::::::::::::::::::::::::::>', '\n'].join('\n'));
  });
  
  if (!sumanOpts.no_tables) {
    
    s.on(String(events.STANDARD_TABLE), function (table: Object) {
      console.log('\n\n');
      let str = table.toString();
      str = '\t' + str;
      console.log(str.replace(/\n/g, '\n\t'));
      console.log('\n');
    });
    
    s.on(String(events.RUNNER_RESULTS_TABLE), function (allResultsTableString: string) {
      onAnyEvent('\n\n' + allResultsTableString.replace(/\n/g, '\n\t') + '\n\n')
    });
    
    s.on(String(events.RUNNER_RESULTS_TABLE_SORTED_BY_MILLIS), function (strSorted: string) {
      onAnyEvent('\n\n' + strSorted.replace(/\n/g, '\n\t') + '\n\n')
    });
    
    s.on(String(events.RUNNER_OVERALL_RESULTS_TABLE), function (overallResultsTableString: string) {
      onAnyEvent(overallResultsTableString.replace(/\n/g, '\n\t') + '\n\n')
    });
    
  }
  
  return retContainer.ret = <IRet>{
    reporterName,
    results
  };
  
});

export default loadreporter;
