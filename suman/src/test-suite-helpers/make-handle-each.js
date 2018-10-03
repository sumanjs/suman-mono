'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const domain = require("domain");
const util = require("util");
const chalk_1 = require("chalk");
const fnArgs = require('function-arguments');
const _suman = global.__suman = (global.__suman || {});
const su = require("suman-utils");
const suman_constants_1 = require("../config/suman-constants");
const general_1 = require("../helpers/general");
const each_hook_param_1 = require("../test-suite-params/each-hook/each-hook-param");
const make_fini_callbacks_1 = require("./make-fini-callbacks");
const helpers = require("./handle-promise-generator");
exports.makeHandleBeforeOrAfterEach = function (suman, gracefulExit) {
    return function handleBeforeOrAfterEach(self, test, aBeforeOrAfterEach, cb, retryData) {
        if (_suman.uncaughtExceptionTriggered) {
            _suman.log.error('runtime error => uncaughtException experienced => halting program.');
            return;
        }
        const { sumanOpts } = _suman;
        aBeforeOrAfterEach.alreadyInitiated = true;
        if (test.skipped || test.stubbed) {
            return process.nextTick(cb);
        }
        if (test.failed && aBeforeOrAfterEach.type === 'beforeEach/setupTest') {
            return process.nextTick(cb);
        }
        const timerObj = {
            timer: null
        };
        const assertCount = {
            num: 0
        };
        const d = domain.create();
        d.sumanEachHook = true;
        d.sumanEachHookName = aBeforeOrAfterEach.desc || '(unknown hook name)';
        d.testDescription = test.desc || '(unknown test case name)';
        const fini = make_fini_callbacks_1.makeEachHookCallback(d, assertCount, aBeforeOrAfterEach, timerObj, gracefulExit, cb);
        const fnStr = aBeforeOrAfterEach.fn.toString();
        let dError = false, retries;
        if (suman.config.retriesEnabled === true && Number.isInteger((retries = test.retries))) {
            _suman.log.warning('enabled retries.');
            fini.retryFn = retryData ? retryData.retryFn : handleBeforeOrAfterEach.bind(null, arguments);
        }
        const handlePossibleError = (err) => {
            if (err) {
                if (typeof err !== 'object') {
                    err = new Error(util.inspect(err));
                }
                err.sumanFatal = Boolean(sumanOpts.bail);
                handleError(err);
            }
            else {
                fini(null);
            }
        };
        const handleError = (err) => {
            if (aBeforeOrAfterEach.dynamicallySkipped === true) {
                err && _suman.log.warning('Hook was dynamically skipped, but error occurred:', err.message || util.inspect(err));
                return fini(null);
            }
            if (fini.retryFn) {
                if (!retryData) {
                    return fini.retryFn({ retryFn: fini.retryFn, retryCount: 1, maxRetries: retries });
                }
                else if (retryData.retryCount < retries) {
                    retryData.retryCount++;
                    return fini.retryFn(retryData);
                }
                else {
                    _suman.log.error('Maximum retries attempted.');
                }
            }
            const errMessage = err && (err.stack || err.message || util.inspect(err));
            err = general_1.cloneError(aBeforeOrAfterEach.warningErr, errMessage, false);
            test.failed = true;
            test.error = err;
            const stk = err.stack || err;
            const formatedStk = typeof stk === 'string' ? stk : util.inspect(stk);
            if (!dError) {
                dError = true;
                if (aBeforeOrAfterEach.fatal !== true) {
                    _suman.log.warning(chalk_1.default.black.bold('Error in each hook:'));
                    _suman.log.warning(formatedStk);
                    _suman.writeTestError(suman_constants_1.constants.SUMAN_HOOK_FATAL_WARNING_MESSAGE + formatedStk);
                    fini(null);
                }
                else {
                    gracefulExit({
                        sumanFatal: true,
                        sumanExitCode: suman_constants_1.constants.EXIT_CODES.FATAL_HOOK_ERROR,
                        stack: suman_constants_1.constants.SUMAN_HOOK_FATAL_MESSAGE + formatedStk
                    });
                }
            }
            else {
                d.removeAllListeners();
                _suman.writeTestError('Suman error => Error in each hook => \n' + stk);
            }
        };
        d.on('error', handleError);
        process.nextTick(() => {
            _suman.activeDomain = d;
            if (sumanOpts.debug_hooks) {
                _suman.log.info(`now running each hook with name '${chalk_1.default.yellow.bold(aBeforeOrAfterEach.desc)}', ` +
                    `for test case with name '${chalk_1.default.magenta(test.desc)}'.`);
            }
            d.run(function runHandleEachHook() {
                let isAsyncAwait = false;
                if (fnStr.indexOf('async') === 0) {
                    isAsyncAwait = true;
                }
                const h = new each_hook_param_1.EachHookParam(aBeforeOrAfterEach, assertCount, handleError, fini, timerObj);
                fini.thot = h;
                h.test = {};
                h.test.desc = test.desc;
                h.test.testId = test.testId;
                if (aBeforeOrAfterEach.type === 'afterEach/teardownTest') {
                    h.test.result = test.error ? 'failed' : 'passed';
                    h.test.error = test.error || null;
                }
                h.data = test.data;
                h.desc = aBeforeOrAfterEach.desc;
                h.value = test.value;
                h.state = 'pending';
                h.__shared = self.shared;
                h.supply = h.__supply = self.supply;
                if (su.isGeneratorFn(aBeforeOrAfterEach.fn)) {
                    const handlePotentialPromise = helpers.handleReturnVal(handlePossibleError, fnStr, aBeforeOrAfterEach);
                    handlePotentialPromise(helpers.handleGenerator(aBeforeOrAfterEach.fn, h));
                }
                else if (aBeforeOrAfterEach.cb) {
                    h.callbackMode = true;
                    const dne = function (err) {
                        h.handlePossibleError(err);
                    };
                    h.done = dne;
                    h.ctn = h.pass = function (ignoredError) {
                        fini(null);
                    };
                    let arg = Object.setPrototypeOf(dne, h);
                    if (aBeforeOrAfterEach.fn.call(null, arg)) {
                        _suman.writeTestError(general_1.cloneError(aBeforeOrAfterEach.warningErr, suman_constants_1.constants.warnings.RETURNED_VAL_DESPITE_CALLBACK_MODE, true).stack);
                    }
                }
                else {
                    const handlePotentialPromise = helpers.handleReturnVal(handlePossibleError, fnStr, aBeforeOrAfterEach);
                    handlePotentialPromise(aBeforeOrAfterEach.fn.call(null, h), false);
                }
            });
        });
    };
};
