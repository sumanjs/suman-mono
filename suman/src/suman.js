'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const path = require("path");
const assert = require("assert");
const EE = require("events");
const flattenDeep = require('lodash.flattendeep');
const AsciiTable = require('ascii-table');
const async = require("async");
const fnArgs = require('function-arguments');
const suman_events_1 = require("suman-events");
const su = require("suman-utils");
const _suman = global.__suman = (global.__suman || {});
const suman_constants_1 = require("./config/suman-constants");
const resultBroadcaster = _suman.resultBroadcaster = (_suman.resultBroadcaster || new EE());
let sumanId = 0;
class Suman {
    constructor(obj) {
        const projectRoot = _suman.projectRoot;
        const sumanConfig = this.config = obj.config;
        const sumanOpts = this.opts = obj.opts;
        this.fileName = obj.fileName;
        this.slicedFileName = obj.fileName.slice(projectRoot.length);
        this.timestamp = obj.timestamp;
        this.sumanId = ++sumanId;
        this.allDescribeBlocks = [];
        this.itOnlyIsTriggered = false;
        this.describeOnlyIsTriggered = false;
        this.deps = null;
        this.numHooksSkipped = 0;
        this.numHooksStubbed = 0;
        this.numBlocksSkipped = 0;
        this.force = obj.force || false;
        this.testBlockMethodCache = new Map();
        this.iocPromiseContainer = {};
        let q;
        this.getQueue = function () {
            if (!q) {
                let envTotal, envConfig;
                if (process.env.DEFAULT_PARALLEL_TOTAL_LIMIT && (envTotal = Number(process.env.DEFAULT_PARALLEL_TOTAL_LIMIT))) {
                    assert(Number.isInteger(envTotal), 'process.env.DEFAULT_PARALLEL_TOTAL_LIMIT cannot be cast to an integer.');
                }
                if (sumanConfig.DEFAULT_PARALLEL_TOTAL_LIMIT &&
                    (envConfig = Number(sumanConfig.DEFAULT_PARALLEL_TOTAL_LIMIT))) {
                    assert(Number.isInteger(envConfig), 'process.env.DEFAULT_PARALLEL_TOTAL_LIMIT cannot be cast to an integer.');
                }
                let c = 1;
                if (!sumanOpts.series) {
                    c = envTotal || envConfig || suman_constants_1.constants.DEFAULT_PARALLEL_TOTAL_LIMIT;
                }
                assert(Number.isInteger(c) && c > 0 && c < 301, 'DEFAULT_PARALLEL_TOTAL_LIMIT must be an integer between 1 and 300 inclusive.');
                q = async.queue((task, cb) => task(cb), c);
            }
            return q;
        };
    }
    getTableData() {
        throw new Error('Suman implementation error => not yet implemented.');
    }
    logFinished($exitCode, skippedString, cb) {
        let combine = function (prev, curr) {
            return prev + curr;
        };
        let exitCode = $exitCode || 999;
        const desc = this.rootSuiteDescription;
        const suiteName = desc.length > 50 ? '...' + desc.substring(desc.length - 50, desc.length) : desc;
        const suiteNameShortened = desc.length > 15 ? desc.substring(0, 12) + '...' : desc;
        let delta = this.dateSuiteFinished - this.dateSuiteStarted;
        let deltaTotal = this.dateSuiteFinished - _suman.dateEverythingStarted;
        const skippedSuiteNames = [];
        let suitesTotal = null, suitesSkipped = null, testsSkipped = null, testsStubbed = null, testsPassed = null, testsFailed = null, totalTests = null;
        let completionMessage = ' (implementation error, please report) ';
        if ($exitCode === 0 && skippedString) {
            completionMessage = '(Test suite was skipped)';
            exitCode = 0;
        }
        else if ($exitCode === 0 && !skippedString) {
            completionMessage = 'Ran to completion';
            suitesTotal = this.allDescribeBlocks.length;
            suitesSkipped = this.allDescribeBlocks.filter(block => {
                if (block.skipped || block.skippedDueToOnly) {
                    skippedSuiteNames.push(block.desc);
                    return true;
                }
            }).length;
            if (suitesSkipped > 0) {
                _suman.log.error('Suman implementation warning => suites skipped was non-zero ' +
                    'outside of suman.numBlocksSkipped value.');
            }
            suitesSkipped += this.numBlocksSkipped;
            testsSkipped = this.allDescribeBlocks.map(function (block) {
                if (block.skipped || block.skippedDueToOnly) {
                    return block.getParallelTests().concat(block.getTests()).length;
                }
                else {
                    return block.getParallelTests().concat(block.getTests()).filter(function (test) {
                        return (test.skipped || test.skippedDueToOnly) && !test.stubbed;
                    }).length;
                }
            })
                .reduce(combine);
            testsStubbed = this.allDescribeBlocks.map(function (block) {
                return block.getParallelTests().concat(block.getTests())
                    .filter(function (test) {
                    return test.stubbed;
                }).length;
            }).reduce(combine);
            testsPassed = this.allDescribeBlocks.map(function (block) {
                if (block.skipped || block.skippedDueToOnly) {
                    return 0;
                }
                else {
                    return block.getParallelTests().concat(block.getTests()).filter(function (test) {
                        return !test.skipped && !test.skippedDueToOnly && test.error == null && test.complete === true;
                    }).length;
                }
            })
                .reduce(combine);
            testsFailed = this.allDescribeBlocks.map(function (block) {
                if (block.skipped || block.skippedDueToOnly) {
                    return 0;
                }
                else {
                    return block.getParallelTests().concat(block.getTests()).filter(function (test) {
                        return !test.skipped && !test.skippedDueToOnly && test.error;
                    }).length;
                }
            })
                .reduce(combine);
            totalTests = this.allDescribeBlocks.map(function (block) {
                return block.getParallelTests().concat(block.getTests()).length;
            })
                .reduce(combine);
            if (testsFailed > 0) {
                exitCode = suman_constants_1.constants.EXIT_CODES.TEST_CASE_FAIL;
            }
            else {
                exitCode = suman_constants_1.constants.EXIT_CODES.SUCCESSFUL_RUN;
            }
        }
        else {
            completionMessage = ' Test file errored out.';
        }
        const deltaStrg = String((typeof delta === 'number' && !Number.isNaN(delta)) ? delta : 'N/A');
        const deltaTotalStr = String((typeof deltaTotal === 'number' && !Number.isNaN(deltaTotal)) ? deltaTotal : 'N/A');
        const deltaSeconds = (typeof delta === 'number' && !Number.isNaN(delta)) ?
            Number(delta / 1000).toFixed(4) : 'N/A';
        const deltaTotalSeconds = (typeof deltaTotal === 'number' && !Number.isNaN(deltaTotal)) ?
            Number(deltaTotal / 1000).toFixed(4) : 'N/A';
        const passingRate = (typeof testsPassed === 'number' && typeof totalTests === 'number' && totalTests > 0) ?
            Number(100 * (testsPassed / totalTests)).toFixed(2) + '%' : 'N/A';
        if (_suman.usingRunner) {
            const d = {
                ROOT_SUITE_NAME: suiteNameShortened,
                SUITE_COUNT: suitesTotal,
                SUITE_SKIPPED_COUNT: suitesSkipped,
                TEST_CASES_TOTAL: totalTests,
                TEST_CASES_FAILED: testsFailed,
                TEST_CASES_PASSED: testsPassed,
                TEST_CASES_SKIPPED: testsSkipped,
                TEST_CASES_STUBBED: testsStubbed,
                TEST_SUMAN_MILLIS: deltaStrg,
                TEST_FILE_MILLIS: deltaTotalStr
            };
            process.nextTick(cb, null, {
                exitCode: exitCode,
                tableData: d
            });
        }
        else {
            const table = new AsciiTable('Results for: ' + suiteName);
            table.setHeading('Metric', '    Value   ', '    Comments   ');
            if (skippedString) {
                table.addRow('Status', completionMessage, skippedString);
            }
            else {
                table.addRow('Status', completionMessage, '            ');
                table.addRow('Num. of Unskipped Test Blocks', suitesTotal, '');
                table.addRow('Test blocks skipped', suitesSkipped ? 'At least ' + suitesSkipped : '-', skippedSuiteNames.length > 0 ? su.customStringify(skippedSuiteNames) : '');
                table.addRow('Hooks skipped', this.numHooksSkipped ?
                    'At least ' + this.numHooksSkipped : '-', su.padWithXSpaces(33) + '-');
                table.addRow('Hooks stubbed', this.numHooksStubbed ?
                    'At least ' + this.numHooksStubbed : '-', su.padWithXSpaces(33) + '-');
                table.addRow('--------------------------', '         ---', su.padWithXSpaces(33) + '-');
                table.addRow('Tests skipped', suitesSkipped ? 'At least ' + testsSkipped : (testsSkipped || '-'));
                table.addRow('Tests stubbed', testsStubbed || '-');
                table.addRow('Tests passed', testsPassed || '-');
                table.addRow('Tests failed', testsFailed || '-');
                table.addRow('Tests total', totalTests || '-');
                table.addRow('--------------------------', su.padWithXSpaces(10) + '---', su.padWithXSpaces(33) + '-');
                table.addRow('Passing rate', passingRate);
                table.addRow('Actual time millis (delta)', deltaStrg, su.padWithXSpaces(33) + '-');
                table.addRow('Actual time seconds (delta)', deltaSeconds, su.padWithXSpaces(33) + '-');
                table.addRow('Total time millis (delta)', deltaTotalStr, su.padWithXSpaces(33) + '-');
                table.addRow('Total time seconds (delta)', deltaTotalSeconds, su.padWithXSpaces(33) + '-');
            }
            table.setAlign(0, AsciiTable.LEFT);
            table.setAlign(1, AsciiTable.RIGHT);
            table.setAlign(2, AsciiTable.RIGHT);
            process.nextTick(cb, null, {
                exitCode: exitCode,
                tableData: table
            });
        }
    }
    logResult(test) {
        const sumanOpts = this.opts;
        if (false && sumanOpts.errors_only && test.dateComplete) {
            return;
        }
        test.error = test.error ? (test.error._message || test.error.message || test.error.stack || test.error) : null;
        test.name = (test.desc || test.name);
        test.desc = (test.desc || test.name);
        test.filePath = test.filePath || this.fileName;
        resultBroadcaster.emit(String(suman_events_1.events.TEST_CASE_END), test);
        if (test.error || test.errorDisplay) {
            resultBroadcaster.emit(String(suman_events_1.events.TEST_CASE_FAIL), test);
        }
        else if (test.skipped) {
            resultBroadcaster.emit(String(suman_events_1.events.TEST_CASE_SKIPPED), test);
        }
        else if (test.stubbed) {
            resultBroadcaster.emit(String(suman_events_1.events.TEST_CASE_STUBBED), test);
        }
        else {
            resultBroadcaster.emit(String(suman_events_1.events.TEST_CASE_PASS), test);
        }
    }
}
exports.Suman = Suman;
exports.makeSuman = ($module, opts, sumanOpts, sumanConfig) => {
    let liveSumanServer = false;
    if (process.argv.indexOf('--live_suman_server') > -1) {
        liveSumanServer = true;
    }
    let timestamp;
    try {
        if (window) {
            timestamp = Number(_suman.timestamp);
        }
    }
    catch (err) { }
    if (_suman.usingRunner) {
        timestamp = _suman.timestamp = timestamp || Number(process.env.SUMAN_RUNNER_TIMESTAMP);
        if (!timestamp) {
            console.error(new Error('Suman implementation error => no timestamp provided by Suman test runner'));
            process.exit(suman_constants_1.constants.EXIT_CODES.NO_TIMESTAMP_AVAILABLE_IN_TEST);
            return;
        }
    }
    else if (_suman.timestamp) {
        timestamp = Number(_suman.timestamp);
    }
    else {
        timestamp = null;
    }
    return new Suman({
        server: null,
        fileName: path.resolve($module.filename),
        usingLiveSumanServer: liveSumanServer,
        opts: sumanOpts,
        force: opts.force,
        timestamp,
        config: sumanConfig
    });
};
