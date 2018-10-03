'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const domain = require("domain");
const assert = require("assert");
const util = require("util");
const EE = require("events");
const chalk_1 = require("chalk");
const fnArgs = require('function-arguments');
const suman_events_1 = require("suman-events");
const su = require("suman-utils");
const _suman = global.__suman = (global.__suman || {});
const suman_constants_1 = require("../config/suman-constants");
const make_fini_callbacks_1 = require("./make-fini-callbacks");
const helpers = require('./handle-promise-generator');
const general_1 = require("../helpers/general");
const test_case_param_1 = require("../test-suite-params/test-case/test-case-param");
const rb = _suman.resultBroadcaster = _suman.resultBroadcaster || new EE();
exports.makeHandleTest = function (suman, gracefulExit) {
    return function handleTest(self, test, cb, retryData) {
        test.alreadyInitiated = true;
        if (_suman.uncaughtExceptionTriggered) {
            _suman.log.error(`runtime error => "UncaughtException already occurred" => halting program.\n[${__filename}]`);
            return;
        }
        if (test.stubbed) {
            rb.emit(String(suman_events_1.events.TEST_CASE_END), test);
            rb.emit(String(suman_events_1.events.TEST_CASE_STUBBED), test);
            return process.nextTick(cb);
        }
        if (test.skipped) {
            rb.emit(String(suman_events_1.events.TEST_CASE_END), test);
            rb.emit(String(suman_events_1.events.TEST_CASE_SKIPPED), test);
            return process.nextTick(cb);
        }
        const timerObj = {
            timer: null
        };
        const assertCount = {
            num: 0
        };
        const d = domain.create();
        d.sumanTestCase = true;
        d.sumanTestName = test.desc;
        const fnStr = test.fn.toString();
        const fini = make_fini_callbacks_1.makeTestCaseCallback(d, assertCount, test, timerObj, gracefulExit, cb);
        let derror = false, retries;
        const handleErr = function (err) {
            if (test.dynamicallySkipped === true) {
                err && _suman.log.warning('Test case was dynamically skipped, but error occurred:', err.message || util.inspect(err));
                return fini(null);
            }
            if (fini.retryFn) {
                if (!retryData) {
                    _suman.log.warning('retrying for the first time.');
                    return fini.retryFn({ retryFn: fini.retryFn, retryCount: 1, maxRetries: retries });
                }
                else if (retryData.retryCount < retries) {
                    retryData.retryCount++;
                    _suman.log.warning(`retrying for the ${retryData.retryCount} time.`);
                    return fini.retryFn(retryData);
                }
                else {
                    _suman.log.error('maximum retires attempted.');
                }
            }
            const errMessage = err && (err.stack || err.message || util.inspect(err));
            err = general_1.cloneError(test.warningErr, errMessage, false);
            const stk = err.stack || err;
            const stack = typeof stk === 'string' ? stk : util.inspect(stk);
            if (!derror) {
                derror = true;
                fini({ stack });
            }
            else {
                d.removeAllListeners();
                _suman.writeTestError('Suman error => Error in test => \n' + stack);
            }
        };
        if (suman.config.retriesEnabled === true && Number.isInteger((retries = test.retries))) {
            fini.retryFn = retryData ? retryData.retryFn : handleTest.bind(null, ...arguments);
        }
        else if (test.retries && !Number.isInteger(test.retries)) {
            return handleErr(new Error('retries property is not an integer => ' + util.inspect(test.retries)));
        }
        if (test.failed) {
            assert(test.error, 'Suman implementation error: error property should be defined at this point in the program.');
            return handleErr(test.error || new Error('Suman implementation error - <test.error> was falsy.'));
        }
        d.on('error', handleErr);
        process.nextTick(function () {
            const { sumanOpts } = _suman;
            if (sumanOpts.debug_hooks) {
                _suman.log.info(`now starting to run test with name '${chalk_1.default.magenta(test.desc)}'.`);
            }
            d.run(function runHandleTest() {
                _suman.activeDomain = d;
                let warn = false;
                let isAsyncAwait = false;
                if (fnStr.indexOf('async') === 0) {
                    isAsyncAwait = true;
                    warn = true;
                }
                const t = new test_case_param_1.TestCaseParam(test, assertCount, handleErr, fini, timerObj);
                fini.thot = t;
                t.__shared = self.shared;
                t.__supply = self.supply;
                t.supply = new Proxy(self.__supply, {
                    set: t.__inheritedSupply.bind(t)
                });
                test.dateStarted = Date.now();
                if (su.isGeneratorFn(test.fn)) {
                    const handlePotentialPromise = helpers.handleReturnVal(t.handlePossibleError.bind(t), fnStr, test);
                    handlePotentialPromise(helpers.handleGenerator(test.fn, t));
                }
                else if (test.cb === true) {
                    t.callbackMode = true;
                    const dne = function done(err) {
                        t.handlePossibleError(err);
                    };
                    t.done = dne;
                    t.pass = t.ctn = function () {
                        fini(null);
                    };
                    t.fail = function (err) {
                        handleErr(err || new Error('t.fail() was called on test (note that null/undefined value ' +
                            'was passed as first arg to the fail function.)'));
                    };
                    let arg = Object.setPrototypeOf(dne, t);
                    if (test.fn.call(null, arg)) {
                        _suman.writeTestError(general_1.cloneError(test.warningErr, suman_constants_1.constants.warnings.RETURNED_VAL_DESPITE_CALLBACK_MODE, true).stack);
                    }
                }
                else {
                    const handlePotentialPromise = helpers.handleReturnVal(t.handlePossibleError.bind(t), fnStr, test);
                    handlePotentialPromise(test.fn.call(null, t), warn, d);
                }
            });
        });
    };
};
