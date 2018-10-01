'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import EventEmitter = NodeJS.EventEmitter;
import {ITestSuite} from 'suman-types/dts/test-suite';
import {ITestDataObj} from "suman-types/dts/it";
import {ISumanChildProcess} from "suman-types/dts/runner";
import {ITableData} from "suman-types/dts/table-data";
import {IRet, IRetContainer, IExpectedCounts, IResultsObj, ITAPJSONTestCase} from 'suman-types/dts/reporters';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';

//npm
import su = require("suman-utils");
import chalk from 'chalk';

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {events} from 'suman-events';
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);
const noColors = process.argv.indexOf('--no-color') > 0;
const noop = function () {};

interface IStringVarargs {
  (...args: string[]): void;
}

//////////////////////////////////////////////////////////////////////////////////////////

export const loadReporter = wrapReporter(reporterName, (retContainer: IRetContainer, results: IResultsObj,
                                                        s: EventEmitter, sumanOpts: ISumanOpts) => {
  
  const testCaseFailures: Array<ITestDataObj> = [];

  const settings = {
    first: true
  };

  
  let onAnyEvent: IStringVarargs = function () {
    const args = Array.from(arguments).map(function (data) {
      return typeof data === 'string' ? data : util.inspect(data);
    });
    
    // log.info(...args);
    console.log.apply(console, args);
  };
  
  let onTestCaseEvent: IStringVarargs = function () {

    if (settings.first) {
      settings.first = false;
      if (!('val' in _suman.currentPaddingCount) && sumanOpts.series) {
        log.warning(`'${reporterName}' reporter may be unable to properly indent output.\n`);
      }
    }
    
    const args = Array.from(arguments).map(function (data) {
      return chalk.bold(typeof data === 'string' ? data : util.inspect(data));
    })
    .join(' ');
    
    let amount = _suman.processIsRunner || !_suman.currentPaddingCount ? 0 : (_suman.currentPaddingCount.val || 0);
    printTestCaseEvent(args, amount);
  };
  
  let printTestCaseEvent = function (str: string, paddingCount: number) {

    if(settings.first){
      settings.first = false;
    }

    if (!_suman.isTestMostRecentLog) {
      _suman.isTestMostRecentLog = true;
      console.log(); // log a new line
    }
    paddingCount = paddingCount || 0;
    const padding = _suman.processIsRunner ? su.padWithXSpaces(0) : su.padWithXSpaces(paddingCount + 4);
    console.log.call(console, padding, str);
    
  };
  
  let onVerboseEvent = function (data: any) {
    if (su.vgt(6)) {
      log.info(typeof data === 'string' ? data : util.inspect(data));
    }
  };
  
  let getTestCaseFailedStr = function (test: ITestDataObj): string {
    
    let str: string;
    if (_suman.processIsRunner) {
      let testPath = ` ${test.filePath || test.filepath || '(unknown test path)'} `;
      str = ` ${chalk.bgYellow.black.bold(` [${results.n}] \u2718 test case fail => `)}${chalk.bgBlack.white.bold(` "${test.desc}" `)} \n` +
        `  ${chalk.gray.bold.underline(' Originating entry test path => ')}` +
        `${chalk.gray.bold(testPath)}\n` +
        `${chalk.yellow.bold(String(test.errorDisplay || test.error || ''))}`;
    }
    else {
      str = ` ${chalk.bgWhite.black.bold(` [${results.n}]  \u2718  => test case fail `)}` +
        ` "${test.desc}"\n  ${chalk.yellow.bold(String(test.errorDisplay || test.error || ''))}`;
    }
    
    return str;
  };
  
  let getTestCaseFailedSummaryStr = function (test: ITestDataObj, count: number): string {
    
    let testPath = ` ${test.filePath || test.filepath || '(unknown test path)'} `;
    return ` ${chalk.bgRed.white.bold(` \u2718 Failure number: ${count} => `)}${chalk.bgBlack.white.bold(` "${test.desc}" `)} \n` +
      `  ${chalk.gray.bold.underline(' Originating entry test path => ')}` +
      `${chalk.black.bold(testPath)}\n` +
      `${chalk.yellow.bold(String(test.errorDisplay || test.error || ''))}`;
  };
  
  s.on(String(events.SUMAN_CONTEXT_BLOCK), function (b: ITestSuite) {
    console.log('\n', su.padWithXSpaces(_suman.currentPaddingCount.val), chalk.gray.bold.italic(` ▶ group: '${b.desc}' ▶ `));
  });
  
  s.on(String(events.SUMAN_CONTEXT_BLOCK_TAP_JSON), function (b: Object) {
    console.log('\n', su.padWithXSpaces(b.padding), chalk.gray.bold.italic(b.message));
  });
  
  s.on(String(events.RUNNER_EXIT_CODE_GREATER_THAN_ZERO), noop);
  
  s.on(String(events.FILE_IS_NOT_DOT_JS), function (dir: string) {
    onAnyEvent('\n => Warning -> Suman will attempt to execute the following file:\n "' +
      chalk.cyan(dir) + '",\n (which is not a .js file).\n');
  });
  
  s.on(String(events.RUNNER_INITIAL_SET),
    function (forkedCPs: Array<ISumanChildProcess>, processes: string, suites: string) {
      onAnyEvent('\n\n\t', chalk.bgBlue.yellow(' => [Suman runner] =>  initial set => ' +
        forkedCPs.length + ' ' + processes + ' running ' + forkedCPs.length + ' ' + suites + ' '), '\n');
    });
  
  s.on(String(events.RUNNER_OVERALL_SET),
    function (totalCount: number, processes: string, suites: string, addendum: string) {
      onAnyEvent('\t ' + chalk.bgBlue.yellow(' => [Suman runner] =>  overall set => '
        + totalCount + ' ' + processes + ' will run ' + totalCount + ' ' + (suites + addendum) + ' ') + '\n\n\n');
    });
  
  s.on(String(events.RUNNER_ASCII_LOGO), function (logo: string) {
    onAnyEvent(logo, '\n');
  });
  
  s.on(String(events.FATAL_TEST_ERROR), onAnyEvent);
  
  let onTestCaseFailed = function (test: ITestDataObj): string {
    results.failures++;
    
    let str: string;
    if (_suman.processIsRunner) {
      let testPath = ` ${test.filePath || test.filepath || '(uknown test path)'} `;
      str = ` ${chalk.bgYellow.black.bold(` [${results.n}] \u2718 test case fail => `)}${chalk.bgBlack.white(` "${test.desc}" `)} \n` +
        `  ${chalk.gray.bold.underline(' Originating entry test path => ')}` +
        `${chalk.black.bold(testPath)}\n` +
        `${chalk.yellow.bold(String(test.errorDisplay || test.error || ''))}`;
    }
    else {
      str = ` ${chalk.bgWhite.black.bold(` [${results.n}]  \u2718  => test fail `)}` +
        ` "${test.desc}"\n  ${chalk.yellow.bold(String(test.errorDisplay || test.error || ''))}`;
    }
    
    return str;
  };
  
  let onTestCasePass = function (test: ITestDataObj): string {
    results.passes++;
    let timeDiffStr = (test.dateComplete ? '(' + ((test.dateComplete - test.dateStarted) || '< 1') + 'ms)' : '');
    return `${chalk.green(` [${results.n}] ${chalk.bold('✔')}`)} '${test.desc}' ${timeDiffStr}`;
  };
  
  let onTestCaseSkipped = function (test: ITestDataObj): string {
    results.skipped++;
    return `${chalk.yellow(` [${results.n}] \u21AA`)} '${test.desc}' ${chalk.italic.grey('(skipped)')}`
  };
  
  let onTestCaseStubbed = function (test: ITestDataObj): string {
    results.stubbed++;
    return `${chalk.yellow(` [${results.n}] \u2026`)} '${test.desc}' ${chalk.italic.grey('(stubbed)')}`
  };
  
  let onTestCaseEnd = function () {
    results.n++;
  };
  
  s.on(String(events.TEST_CASE_END), function () {
    onTestCaseEnd();
  });
  
  // s.on(String(events.TEST_CASE_FAIL), function (test: ITestDataObj) {
  //   test =  test.testCase || test;
  //   console.log();
  //   onTestCaseEvent(onTestCaseFailed(test));
  //   console.log();
  // });
  
  s.on(String(events.TEST_CASE_FAIL), function (test: ITestDataObj) {
    test =  test.testCase || test;
    results.failures++;
    testCaseFailures.push(test);
    console.log();
    onTestCaseEvent(getTestCaseFailedStr(test));
    console.log();
  });
  
  s.on(String(events.TEST_CASE_PASS), function (test: ITestDataObj) {
    test = test.testCase || test;
    onTestCaseEvent(onTestCasePass(test));
  });
  
  s.on(String(events.TEST_CASE_SKIPPED), function (test: ITestDataObj) {
    test =  test.testCase || test;
    onTestCaseEvent(onTestCaseSkipped(test));
  });
  
  s.on(String(events.TEST_CASE_STUBBED), function (test: ITestDataObj) {
    test = test.testCase || test;
    onTestCaseEvent(onTestCaseStubbed(test));
  });
  
  s.on(String(events.TEST_CASE_END_TAP_JSON), function () {
    onTestCaseEnd();
  });
  
  // s.on(String(events.TEST_CASE_FAIL_TAP_JSON), function (d: ITAPJSONTestCase) {
  //   const str = onTestCaseFailed(d.testCase as any);
  //   console.log();
  //   printTestCaseEvent(str, d.padding);
  //   console.log();
  // });
  
  s.on(String(events.TEST_CASE_FAIL_TAP_JSON), function (d: ITAPJSONTestCase) {
    results.failures++;
    testCaseFailures.push(d.testCase as any);
    const str = getTestCaseFailedStr(d.testCase as any);
    console.log();
    printTestCaseEvent(str, d.padding);
    console.log();
  });
  
  s.on(String(events.TEST_CASE_PASS_TAP_JSON), function (d: ITAPJSONTestCase) {
    const str = onTestCasePass(d.testCase as any);
    printTestCaseEvent(str, d.padding);
  });
  
  s.on(String(events.TEST_CASE_SKIPPED_TAP_JSON), function (d: ITAPJSONTestCase) {
    const str = onTestCaseSkipped(d.testCase as any);
    printTestCaseEvent(str, d.padding);
  });
  
  s.on(String(events.TEST_CASE_STUBBED_TAP_JSON), function (d: ITAPJSONTestCase) {
    const str = onTestCaseStubbed(d.testCase as any);
    printTestCaseEvent(str, d.padding);
  });
  
  s.on(String(events.RUNNER_EXIT_SIGNAL), function (signal: any) {
    onAnyEvent(['<::::::::::::::::::::: Runner Exit Signal => ' + signal + ' ::::::::::::::::::::::::>'].join('\n'));
  });
  
  s.on(String(events.RUNNER_EXIT_CODE), function (code: number) {
    onAnyEvent(['\n  ',
      ' <::::::::::::::::::::::::::::::::: Suman runner exiting with exit code: ' + code +
      ' :::::::::::::::::::::::::::::::::>', '\n'].join('\n'));
  });
  
  //on verbose
  s.on(String(events.ERRORS_ONLY_OPTION), function () {
    onVerboseEvent(chalk.white.green.bold(` => ${chalk.white.bold('"--errors-only"')}  option used, hopefully you don't see much output until the end :) `));
  });
  
  s.on(String(events.USING_SERVER_MARKED_BY_HOSTNAME), onVerboseEvent);
  s.on(String(events.USING_FALLBACK_SERVER), onVerboseEvent);
  s.on(String(events.USING_DEFAULT_SERVER), onVerboseEvent);
  
  s.on(String(events.FILENAME_DOES_NOT_MATCH_ANY), function (dir: string) {
    onVerboseEvent(` => You may have wanted to run file/folder with this name: '${chalk.bold(dir)}',\n\t` +
      `but it didnt match the regex(es) you passed in as input for "matchAny".`);
  });
  
  s.on(String(events.FILENAME_DOES_NOT_MATCH_NONE), function (dir: string) {
    onVerboseEvent(` => You may have wanted to run file/folder with this name: '${chalk.bold(dir)}',\n\t` +
      `but it didnt match the regex(es) you passed in as input for "matchNone".`);
  });
  
  s.on(String(events.FILENAME_DOES_NOT_MATCH_ALL), function (dir: string) {
    onVerboseEvent(` => You may have wanted to run file/folder with this name: '${chalk.bold(dir)}',\n\t` +
      `but it didnt match the regex(es) you passed in as input for "matchAll"`);
  });
  
  s.on(String(events.RUNNER_SAYS_FILE_HAS_JUST_STARTED_RUNNING), function (file: string) {
    !settings.first && console.log(); // we only add a newline if no test cases printed yet
    log.info(chalk.bold('File has just started running =>'), chalk.grey.bold(`'${file}'`));
    !settings.first && console.log(); // we only add a newline if no test cases printed yet
  });
  
  s.on(String(events.RUNNER_HIT_DIRECTORY_BUT_NOT_RECURSIVE), onVerboseEvent);
  
  //ignore these
  s.on(String(events.RUNNER_STARTED), noop);
  
  s.on(String(events.RUNNER_ENDED), function (date: any) {
    
    if (testCaseFailures.length) {
      log.info(chalk.red.bold.underline('You have at least one test case failure. Complete list of test case failures:'));
    }
    
    testCaseFailures.forEach(function (d: ITestDataObj, i: number) {
      const str = getTestCaseFailedSummaryStr(d as any, i + 1);
      console.log();
      printTestCaseEvent(str, 0);
      console.log();
    });
  });
  
  s.on(String(events.SUITE_SKIPPED), noop);
  s.on(String(events.SUITE_END), noop);
  s.on(String(events.TEST_END), noop);
  s.on(String(events.RUNNER_EXIT_CODE_IS_ZERO), noop);
  
  s.on(String(events.RUNNER_TEST_PATHS_CONFIRMATION), function (files: Array<string>) {
    if (sumanOpts.verbosity > 5) {
      onAnyEvent(['\n ' + chalk.bgBlack.white.bold(' Suman will attempt to execute test files with/within the following paths: '),
        '\n',
        files.map((p, i) => '\t ' + (i + 1) + ' => ' + chalk.bold('"' + p + '"')).join('\n') + '\n\n'].join(''))
    }
  });
  
  if (!sumanOpts.no_tables) {
    
    s.on(String(events.RUNNER_RESULTS_TABLE), function (allResultsTableString: string) {
      onAnyEvent('\n\n' + allResultsTableString.replace(/\n/g, '\n\t') + '\n\n')
    });
    
    s.on(String(events.RUNNER_RESULTS_TABLE_SORTED_BY_MILLIS), function (strSorted: string) {
      onAnyEvent('\n\n' + strSorted.replace(/\n/g, '\n\t') + '\n\n')
    });
    
    s.on(String(events.RUNNER_OVERALL_RESULTS_TABLE), function (overallResultsTableString: string) {
      onAnyEvent(overallResultsTableString.replace(/\n/g, '\n\t') + '\n\n')
    });
    
    s.on(String(events.STANDARD_TABLE), function (table: ITableData, code: number) {
      console.log('\n\n');
      let str = table.toString();
      str = code > 0 ? chalk.yellow.bold(str) : chalk.gray(str);
      str = '\t' + str;
      console.log(str.replace(/\n/g, '\n\t'));
      console.log('\n');
    });
  }
  
  // we can add values to ret as needed later
  return retContainer.ret = <IRet>{
    results,
    reporterName
  };
  
});

export default loadReporter;
