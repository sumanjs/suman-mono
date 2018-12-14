'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const util = require("util");
const assert = require("assert");
const chalk_1 = require("chalk");
const _suman = global.__suman = (global.__suman || {});
const suman_constants_1 = require("../config/suman-constants");
const general_1 = require("../helpers/general");
const missingHookOrTest = function () {
    const mzg = new Error('Suman implementation error, please report! ' +
        'Neither test nor hook defined, where at least one should be.');
    console.error(mzg.stack);
    _suman.writeTestError(mzg.stack);
    return mzg;
};
const planHelper = function (testOrHook, assertCount) {
    if (testOrHook.planCountExpected !== undefined) {
        try {
            assert(Number.isInteger(testOrHook.planCountExpected), 'Suman usage error => "plan" option must be an integer.');
        }
        catch (err) {
            return err;
        }
    }
    if (Number.isInteger(testOrHook.planCountExpected) && testOrHook.planCountExpected !== assertCount.num) {
        let errorPlanCount = 'Error => Expected plan count was ' + testOrHook.planCountExpected +
            ', but actual assertion/confirm count was ' + assertCount.num;
        return general_1.cloneError(testOrHook.warningErr, errorPlanCount, false);
    }
};
const throwsHelper = function (err, test, hook) {
    const testOrHook = (test || hook);
    if (testOrHook.throws === undefined) {
        return err;
    }
    try {
        assert(testOrHook.throws instanceof RegExp, 'Suman error => "throws" option must be a RegExp instance.');
    }
    catch (e) {
        return e;
    }
    if (!err) {
        let z = testOrHook.didNotThrowErrorWithExpectedMessage =
            'Error => Expected to throw an error matching regex (' + testOrHook.throws + '), ' +
                'but did not throw or pass any error.';
        err = general_1.cloneError(testOrHook.warningErr, z, false);
        if (hook) {
            err.sumanFatal = true;
            err.sumanExitCode = suman_constants_1.constants.EXIT_CODES.HOOK_DID_NOT_THROW_EXPECTED_ERROR;
        }
    }
    else if (err && !String(err.stack || err).match(testOrHook.throws)) {
        let z = testOrHook.didNotThrowErrorWithExpectedMessage =
            'Error => Expected to throw an error matching regex (' + testOrHook.throws + '), ' +
                'although an error was thrown/emitted, it did not match the regular expression.';
        let newErr = general_1.cloneError(testOrHook.warningErr, z, false);
        err = new Error(err.stack + '\n' + newErr.stack);
    }
    else {
        err = null;
    }
    return err;
};
exports.makeAllHookCallback = function (d, assertCount, hook, timerObj, gracefulExit, cb) {
    let calledCount = 0;
    return function allHookFini(err, isTimeout) {
        const { sumanOpts } = _suman;
        if (err) {
            if (String(err.stack || err).match(/Suman usage error/)) {
                err.sumanFatal = true;
                err.sumanExitCode = suman_constants_1.constants.EXIT_CODES.ASYCNCHRONOUS_REGISTRY_OF_TEST_BLOCK_METHODS;
                return gracefulExit(err);
            }
            if (Array.isArray(err)) {
                err = new Error(err.map(e => (e.stack || (typeof e === 'string' ? e : util.inspect(e)))).join('\n\n'));
            }
            else {
                err = typeof err === 'object' ? err : new Error(typeof err === 'string' ? err : util.inspect(err));
            }
            err.isTimeoutErr = isTimeout || false;
        }
        if (++calledCount === 1) {
            if (sumanOpts.debug_hooks) {
                if (d.testDescription) {
                    _suman.log.info(`each hook with name '${chalk_1.default.yellow.bold(hook.desc)}' has completed, ` +
                        `for test case with name '${chalk_1.default.magenta(d.testDescription)}'.`);
                }
                else {
                    _suman.log.info(`hook with name '${chalk_1.default.yellow(hook.desc)}' has completed.`);
                }
            }
            if (!err) {
                err = planHelper(hook, assertCount);
            }
            err = throwsHelper(err, null, hook);
            if (allHookFini.thot) {
                allHookFini.thot.emit('done', err);
                allHookFini.thot.removeAllListeners();
            }
            if (process.domain && d !== process.domain) {
                _suman.log.warning('Suman implementation warning: diverging domains in handle callback helper.');
            }
            try {
                d.exit();
            }
            catch (err) {
                err && _suman.log.error(err.stack || err);
            }
            clearTimeout(timerObj.timer);
            if (err) {
                err.sumanFatal = Boolean(err.sumanFatal || hook.fatal !== false || sumanOpts.bail);
                if (sumanOpts.bail) {
                    err.sumanExitCode = suman_constants_1.constants.EXIT_CODES.HOOK_ERROR_AND_BAIL_IS_TRUE;
                }
            }
            gracefulExit(err, function () {
                cb(null, err);
            });
        }
        else {
            if (err) {
                _suman.writeTestError(err.stack || err);
            }
            if (calledCount > 1 && !hook.timedOut) {
                _suman.writeTestError('\n\nWarning: the following test callback was invoked twice by your code ' +
                    'for the following hook with name => "' + (hook.desc || '(hook has no description)') + '".\n\n');
                _suman.writeTestError('The problematic hook can be located from this error trace => \n' +
                    general_1.cloneError(hook.warningErr, 'The callback was fired more than once for this test case.').stack);
            }
        }
    };
};
exports.makeEachHookCallback = function (d, assertCount, hook, timerObj, gracefulExit, cb) {
    let calledCount = 0;
    return function eachHookFini(err, isTimeout) {
        const { sumanOpts } = _suman;
        if (err) {
            if (String(err.stack || err).match(/Suman usage error/)) {
                err.sumanFatal = true;
                err.sumanExitCode = suman_constants_1.constants.EXIT_CODES.ASYCNCHRONOUS_REGISTRY_OF_TEST_BLOCK_METHODS;
                gracefulExit(err);
                return;
            }
            if (Array.isArray(err)) {
                err = new Error(err.map(e => (e.stack || (typeof e === 'string' ? e : util.inspect(e)))).join('\n\n'));
            }
            else {
                err = typeof err === 'object' ? err : new Error(typeof err === 'string' ? err : util.inspect(err));
            }
            err.isTimeoutErr = isTimeout || false;
        }
        if (++calledCount === 1) {
            if (sumanOpts.debug_hooks) {
                if (d.testDescription) {
                    _suman.log.info(`each hook with name '${chalk_1.default.yellow.bold(hook.desc)}' has completed, ` +
                        `for test case with name '${chalk_1.default.magenta(d.testDescription)}'.`);
                }
                else {
                    _suman.log.info(`hook with name '${chalk_1.default.yellow(hook.desc)}' has completed.`);
                }
            }
            if (!err) {
                err = planHelper(hook, assertCount);
            }
            err = throwsHelper(err, null, hook);
            if (eachHookFini.thot) {
                eachHookFini.thot.emit('done', err);
                eachHookFini.thot.removeAllListeners();
            }
            if (process.domain && d !== process.domain) {
                _suman.log.warning('Suman implementation warning: diverging domains in handle callback helper.');
            }
            try {
                d.exit();
            }
            catch (err) {
                err && _suman.log.error(err.stack || err);
            }
            clearTimeout(timerObj.timer);
            if (err) {
                err.sumanFatal = err.sumanFatal || !!((hook && hook.fatal !== false) || _suman.sumanOpts.bail);
                if (sumanOpts.bail) {
                    if (hook) {
                        err.sumanExitCode = suman_constants_1.constants.EXIT_CODES.HOOK_ERROR_AND_BAIL_IS_TRUE;
                    }
                    else {
                        throw missingHookOrTest();
                    }
                }
            }
            gracefulExit(err, function () {
                cb(null, err);
            });
        }
        else {
            if (err) {
                _suman.writeTestError(err.stack || err);
            }
            if (calledCount > 1 && !hook.timedOut) {
                _suman.writeTestError('\n\nWarning: the following test callback was invoked twice by your code ' +
                    'for the following hook with name => "' + (hook.desc || '(hook has no description)') + '".\n\n');
                _suman.writeTestError('The problematic hook can be located from this error trace => \n' +
                    general_1.cloneError(hook.warningErr, 'The callback was fired more than once for this test case.').stack);
            }
        }
    };
};
exports.makeTestCaseCallback = function (d, assertCount, test, timerObj, gracefulExit, cb) {
    let calledCount = 0;
    return function testCaseFini(err, isTimeout) {
        const { sumanOpts } = _suman;
        if (err) {
            if (String(err.stack || err).match(/Suman usage error/)) {
                err.sumanFatal = true;
                err.sumanExitCode = suman_constants_1.constants.EXIT_CODES.ASYCNCHRONOUS_REGISTRY_OF_TEST_BLOCK_METHODS;
                return gracefulExit(err);
            }
            if (Array.isArray(err)) {
                err = new Error(err.map(e => (e.stack || (typeof e === 'string' ? e : util.inspect(e)))).join('\n\n'));
            }
            else {
                err = typeof err === 'object' ? err : new Error(typeof err === 'string' ? err : util.inspect(err));
            }
            err.isFromTest = true;
            err.isTimeoutErr = isTimeout || false;
        }
        if (++calledCount === 1) {
            if (!err) {
                err = planHelper(test, assertCount);
            }
            err = throwsHelper(err, test, null);
            if (testCaseFini.thot) {
                testCaseFini.thot.emit('done', err);
                testCaseFini.thot.removeAllListeners();
            }
            if (process.domain && d !== process.domain) {
                _suman.log.warning('Suman implementation warning: diverging domains in handle callback helper.');
            }
            try {
                d.exit();
            }
            catch (err) {
                _suman.log.error(err.stack || err);
            }
            clearTimeout(timerObj.timer);
            if (err) {
                err.isFromTest = true;
                err.sumanFatal = err.sumanFatal || sumanOpts.bail;
                test.error = err;
                if (sumanOpts.bail) {
                    err.sumanExitCode = suman_constants_1.constants.EXIT_CODES.TEST_ERROR_AND_BAIL_IS_TRUE;
                }
            }
            else {
                test.complete = true;
                test.dateComplete = Date.now();
            }
            gracefulExit(err, function () {
                cb(null, err);
            });
        }
        else {
            if (err) {
                _suman.writeTestError(err.stack || err);
            }
            if (calledCount > 1 && !test.timedOut) {
                _suman.writeTestError('Warning: the following test callback was invoked twice by your code ' +
                    'for the following test/hook with name => "' + (test ? test.desc : '') + '".');
                _suman.writeTestError('The problematic test case can be located from this error trace => \n' +
                    general_1.cloneError(test.warningErr, 'The callback was fired more than once for this test case.').stack);
            }
        }
    };
};
