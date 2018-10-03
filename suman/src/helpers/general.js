'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const util = require("util");
const assert = require("assert");
const EE = require("events");
const os = require("os");
const path = require("path");
const fs = require("fs");
const su = require("suman-utils");
const chalk_1 = require("chalk");
const async = require("async");
try {
    su.vgt(6) && console.log(' [suman] Attempting to load browser polyfills.');
    if (window) {
        fs = require('suman-browser-polyfills/modules/fs');
        su.vgt(6) && console.log(' [suman] Loaded browser polyfill for "fs".');
    }
}
catch (err) {
}
const _suman = global.__suman = (global.__suman || {});
const suman_events_1 = require("suman-events");
const suman_constants_1 = require("../config/suman-constants");
const suiteResultEmitter = _suman.suiteResultEmitter = (_suman.suiteResultEmitter || new EE());
const results = _suman.tableResults = (_suman.tableResults || []);
const rb = _suman.resultBroadcaster = (_suman.resultBroadcaster || new EE());
const socketio_child_client_1 = require("../index-helpers/socketio-child-client");
const fnArgs = require('function-arguments');
exports.handleSetupComplete = function (zuite, type) {
    if (zuite.isSetupComplete) {
        _suman.log.error('Illegal registry of block method type => "' + type + '()".');
        _suman.log.error(chalk_1.default.red.bold('Suman usage error => fatal => Asynchronous registry of test suite methods. Fatal AF.'), '\n\n');
        const e = new Error('Suman usage error => Fatal error => You have attempted to register calls to a\n' +
            'test suite block that has already finished registering hooks, test cases and child blocks.\n' +
            'To be more exact, one of two things happened: Either (1) ' +
            'You referenced a parent suite block inside a\nchild suite block by accident, or more likely (2) you called registry' +
            ' functions asynchronously.\n' +
            '\nYou cannot call the following functions asynchronously - describe(), it(), ' +
            'before(), beforeEach(), after(), afterEach()\n- do not ' +
            'put these calls inside a setTimeout, setImmediate, process.nextTick or any other asynchronous calls.\n' +
            ' *** !! This includes nesting these calls inside each other. !! ***\n\t' +
            '\nThis is a fatal error because behavior will be completely indeterminate upon asynchronous ' +
            'registry of these calls.');
        _suman.sumanRuntimeErrors.push(e);
        e.sumanFatal = true;
        e.sumanExitCode = suman_constants_1.constants.EXIT_CODES.ASYCNCHRONOUS_REGISTRY_OF_TEST_BLOCK_METHODS;
        e.stack = String(e.stack).split('\n').filter(function (line) {
            return !/\/node_modules\//.test(line) && !/\/next_tick.js/.test(line);
        })
            .join('\n');
        if (zuite) {
            _suman.log.error('Regarding the following test suite with name =>', util.inspect(zuite.title || zuite.desc));
        }
        throw e;
    }
};
exports.makeRequireFile = function (projectRoot) {
    return function (v) {
        try {
            require(v);
            _suman.log.info(chalk_1.default.green(`Suman has pre-loaded module '${chalk_1.default.green.bold(v)}'.`));
        }
        catch (err) {
            let loadedFromResolvedPath = false;
            try {
                if (!path.isAbsolute(v)) {
                    loadedFromResolvedPath = true;
                    v = path.resolve(projectRoot + '/' + v);
                    require(v);
                    _suman.log.info(chalk_1.default.green(`Suman has pre-loaded module '${chalk_1.default.green.bold(v)}'.`));
                }
                else {
                    throw err;
                }
            }
            catch (err) {
                _suman.log.error('There was a problem with one the arguments to "--require" at the command line.');
                _suman.log.error(`Suman could not pre-load module with path "${v}".`);
                if (loadedFromResolvedPath) {
                    _suman.log.error(`Suman also attempted to load this path (resolved from root) "${v}".`);
                }
                throw err;
            }
        }
    };
};
exports.extractVals = function (val) {
    let fn, subDeps, props, timeout;
    if (Array.isArray(val)) {
        fn = val[val.length - 1];
        val.pop();
        subDeps = val.filter(function (v) {
            if (v) {
                if (typeof v !== 'string') {
                    throw new Error(' => There is a problem in your suman.once.pre.js file - ' +
                        'the following key was not a string => ' + util.inspect(v));
                }
                if (String(v).indexOf(':') > -1) {
                    props = props || [];
                    props.push(v);
                    return false;
                }
                return true;
            }
            else {
                console.error(' => You have an empty key in your suman.once.pre.js file.');
                console.error(' => Suman will continue optimistically.');
                return false;
            }
        });
    }
    else {
        subDeps = [];
        fn = val;
    }
    return {
        timeout,
        subDeps,
        fn,
        props
    };
};
exports.makeHandleAsyncReporters = function (reporterRets) {
    return function (cb) {
        if (reporterRets.length < 1) {
            try {
                if (window) {
                    window.__karma__.complete();
                }
            }
            catch (err) {
                _suman.log.error(err.stack || err);
            }
            return process.nextTick(cb);
        }
        let exitCode = 0;
        async.eachLimit(reporterRets, 5, function (item, cb) {
            if (item && item.completionHook) {
                item.completionHook();
            }
            if (item && item.results) {
                if (Number.isInteger(item.results.failures) && item.results.failures > 0) {
                    exitCode = 56;
                }
            }
            if (item && item.count > 0) {
                let timedout = false;
                let timeoutFn = function () {
                    timedout = true;
                    console.error(`async reporter ${util.inspect(item.reporterName || item)}, appears to have timed out.`);
                    cb(null);
                };
                setTimeout(timeoutFn, 5000);
                item.cb = function (err) {
                    err && _suman.log.error(err.stack || err);
                    process.nextTick(cb);
                };
            }
            else {
                process.nextTick(cb);
            }
        }, function () {
            process.nextTick(cb, null, { exitCode });
        });
    };
};
exports.makeRunGenerator = function (fn, ctx) {
    return function () {
        const generator = fn.apply(ctx, arguments);
        const handle = function (result) {
            if (result.done) {
                return Promise.resolve(result.value);
            }
            else {
                return Promise.resolve(result.value).then(function (res) {
                    return handle(generator.next(res));
                }, function (e) {
                    return handle(generator.throw(e));
                });
            }
        };
        try {
            return handle(generator.next());
        }
        catch (e) {
            return Promise.reject(e);
        }
    };
};
exports.asyncHelper = function (key, resolve, reject, $args, ln, fn) {
    if (typeof fn !== 'function') {
        let e = new Error('Suman usage error: would-be function was undefined or otherwise not a function =>\n' + String(fn));
        reject({ key, error: e });
    }
    else if (fn.length > 1 && su.isGeneratorFn(fn)) {
        let e = new Error('Suman usage error: function was a generator function but also took a callback =>\n' + String(fn));
        reject({ key, error: e });
    }
    else if (su.isGeneratorFn(fn)) {
        const gen = exports.makeRunGenerator(fn, null);
        gen.apply(null, $args).then(resolve, function (e) {
            reject({ key: key, error: e });
        });
    }
    else if (fn.length > 1) {
        let args = fnArgs(fn);
        let str = fn.toString();
        let matches = str.match(new RegExp(args[1], 'g')) || [];
        if (matches.length < 2) {
            let e = new Error('Suman usage error => Callback in your function was not present => ' + str);
            return reject({ key: key, error: e });
        }
        $args.push(function (e, val) {
            e ? reject({ key: key, error: e }) : resolve(val);
        });
        fn.apply(null, $args);
    }
    else {
        Promise.resolve(fn.apply(null, $args))
            .then(resolve, function (e) {
            reject({ key: key, error: e });
        });
    }
};
exports.implementationError = function (err, isThrow) {
    if (err) {
        err = new Error('Suman implementation error => Please report!' + '\n' + (err.stack || err));
        _suman.log.error(err.stack);
        _suman.writeTestError(err.stack);
        if (isThrow) {
            throw err;
        }
    }
};
exports.loadSumanConfig = function (configPath, opts) {
    const cwd = process.cwd();
    const projectRoot = _suman.projectRoot = (_suman.projectRoot || su.findProjectRoot(cwd));
    let sumanConfig, pth1, pth2;
    if (!(sumanConfig = _suman.sumanConfig)) {
        if (process.env.SUMAN_CONFIG) {
            sumanConfig = JSON.parse(process.env.SUMAN_CONFIG);
        }
        else {
            try {
                pth1 = path.resolve(path.normalize(cwd + '/' + configPath));
                sumanConfig = require(pth1);
            }
            catch (err) {
                try {
                    pth1 = null;
                    pth2 = path.resolve(path.normalize(projectRoot + '/suman.conf.js'));
                    sumanConfig = require(pth2);
                }
                catch (err) {
                    pth2 = null;
                    sumanConfig = _suman.sumanConfig = require('../default-conf-files/suman.default.conf');
                    _suman.log.error('warning => Using default configuration, ' +
                        'please use "suman --init" to create a suman.conf.js file in the root of your project.');
                }
            }
            if (pth1 || pth2) {
                if (_suman.sumanOpts.verbosity > 8 || su.isSumanDebug()) {
                    _suman.log.info('Path of suman config used: ' + (pth1 || pth2), '\n', 'Value of suman config => ', util.inspect(sumanConfig));
                }
            }
        }
    }
    return _suman.sumanConfig = _suman.sumanConfig || sumanConfig;
};
let resolvedSharedDirs = null;
exports.resolveSharedDirs = function (sumanConfig, projectRoot, sumanOpts) {
    if (resolvedSharedDirs) {
        return resolvedSharedDirs;
    }
    if (sumanOpts.init) {
        return resolvedSharedDirs = {};
    }
    let sumanHelpersDir, shd;
    if (shd = sumanOpts.suman_helpers_dir) {
        sumanHelpersDir = (path.isAbsolute(shd) ? shd : path.resolve(projectRoot + '/' + shd));
    }
    else {
        sumanHelpersDir = path.resolve(projectRoot + '/' + (sumanConfig.sumanHelpersDir || 'suman'));
    }
    let sumanHelpersDirLocated = false;
    try {
        fs.statSync(sumanHelpersDir);
        sumanHelpersDirLocated = true;
    }
    catch (err) {
        _suman.log.warning(err.message);
        if (!/no such file or directory/i.test(err.message)) {
            _suman.log.error(err.stack);
            return process.exit(1);
        }
        _suman.log.warning(`Suman could ${chalk_1.default.magenta('not')} locate your <suman-helpers-dir>.`);
        _suman.log.warning('Perhaps you need to update your suman.conf.js file, please see:');
        _suman.log.info(chalk_1.default.cyan('=> http://sumanjs.org/conf.html'));
        _suman.log.info(`We expected to find your <suman-helpers-dir> here => , ${chalk_1.default.bgBlack.cyan(` ${sumanHelpersDir} `)}`);
        if (false) {
            _suman.log.info(`Exiting because we could not locate the <suman-helpers-dir>, ` +
                `given your configuration and command line options.`);
            return process.exit(suman_constants_1.constants.EXIT_CODES.COULD_NOT_LOCATE_SUMAN_HELPERS_DIR);
        }
        sumanHelpersDir = path.resolve(projectRoot + '/.suman');
        try {
            fs.mkdirSync(sumanHelpersDir);
        }
        catch (err) {
            if (!/EEXIST/i.test(err.message)) {
                _suman.log.error(err.stack);
                return process.exit(suman_constants_1.constants.EXIT_CODES.COULD_NOT_LOCATE_SUMAN_HELPERS_DIR);
            }
        }
    }
    const logDir = path.resolve(sumanHelpersDir + '/logs');
    const integPrePath = path.resolve(sumanHelpersDir + '/suman.once.pre.js');
    const integPostPath = path.resolve(sumanHelpersDir + '/suman.once.post.js');
    const testSrcDirDefined = !!sumanConfig.testSrcDir;
    const testDir = process.env.TEST_DIR = _suman.testDir = path.resolve(projectRoot + '/' + (sumanConfig.testDir || 'test'));
    const testSrcDir = process.env.TEST_SRC_DIR = _suman.testSrcDir = path.resolve(projectRoot + '/' + (sumanConfig.testSrcDir || 'test'));
    const debugStreamPath = path.resolve(sumanHelpersDir + '/logs/test-debug.log');
    return resolvedSharedDirs = Object.freeze({
        sumanHelpersDir: _suman.sumanHelperDirRoot = process.env.SUMAN_HELPERS_DIR_ROOT = sumanHelpersDir,
        sumanLogDir: _suman.sumanLogDir = logDir,
        integPrePath: _suman.integPrePath = integPrePath,
        integPostPath: _suman.integPostPath = integPostPath,
        sumanHelpersDirLocated: sumanHelpersDirLocated,
        testDebugLogPath: _suman.testDebugLogPath = debugStreamPath
    });
};
let loadedSharedObjects = null;
exports.loadSharedObjects = function (pathObj, projectRoot, sumanOpts) {
    try {
        if (window) {
            return loadedSharedObjects = {};
        }
    }
    catch (err) {
    }
    if (loadedSharedObjects) {
        return loadedSharedObjects;
    }
    if (sumanOpts.init) {
        return loadedSharedObjects = {};
    }
    const sumanHelpersDir = _suman.sumanHelperDirRoot;
    const logDir = pathObj.sumanLogDir;
    const sumanHelpersDirLocated = pathObj.sumanHelpersDirLocated;
    try {
        fs.statSync(logDir);
    }
    catch (err) {
        if (sumanHelpersDirLocated) {
            _suman.log.error(chalk_1.default.blue(' Suman could successfully locate your "<suman-helpers-dir>", but...'));
            _suman.log.warning(chalk_1.default.yellow.bold(' ...Suman could not find the "<suman-helpers-dir>/logs" directory'));
            _suman.log.warning(`You may have accidentally deleted it, Suman will re-create one for you.`);
        }
        try {
            fs.mkdirSync(logDir);
        }
        catch (err) {
            _suman.log.error(chalk_1.default.red('Suman fatal problem => Could not create logs directory in your sumanHelpersDir'));
            _suman.log.error('Please report this issue. Original error:');
            _suman.log.error(err.stack);
            return process.exit(suman_constants_1.constants.EXIT_CODES.COULD_NOT_CREATE_LOG_DIR);
        }
    }
    let globalHooksFn, p;
    try {
        p = path.resolve(path.resolve(_suman.sumanHelperDirRoot + '/suman.hooks.js'));
        globalHooksFn = require(p);
        globalHooksFn = globalHooksFn.default || globalHooksFn;
    }
    catch (err) {
        _suman.log.warning(`Could not load ${chalk_1.default.bold('<suman.hook.js>')} at path "${p}".`);
        if (!/Cannot find module/i.test(err.message)) {
            _suman.log.error(err.stack);
            return process.exit(1);
        }
        if (sumanOpts.strict) {
            process.exit(suman_constants_1.constants.EXIT_CODES.SUMAN_PRE_NOT_FOUND_IN_YOUR_PROJECT);
        }
        globalHooksFn = function () {
        };
    }
    let integrantPreFn;
    try {
        p = path.resolve(_suman.sumanHelperDirRoot + '/suman.once.pre.js');
        integrantPreFn = require(p);
        integrantPreFn = integrantPreFn.default || integrantPreFn;
    }
    catch (err) {
        _suman.log.warning(`Could not load ${chalk_1.default.bold('<suman.once.pre.js>')} at path "${p}".`);
        if (!/Cannot find module/i.test(err.message)) {
            _suman.log.error(err.stack);
            return process.exit(1);
        }
        if (sumanOpts.strict) {
            process.exit(suman_constants_1.constants.EXIT_CODES.SUMAN_PRE_NOT_FOUND_IN_YOUR_PROJECT);
        }
        integrantPreFn = function () {
            return { dependencies: {} };
        };
    }
    let iocFn;
    try {
        p = path.resolve(_suman.sumanHelperDirRoot + '/suman.ioc.js');
        iocFn = require(p);
        iocFn = iocFn.default || iocFn;
    }
    catch (err) {
        _suman.log.warning(`Could not load ${chalk_1.default.bold('<suman.ioc.js>')} file at path "${p}".`);
        if (!/Cannot find module/i.test(err.message)) {
            _suman.log.error(err.stack);
            return process.exit(1);
        }
        if (sumanOpts.strict) {
            process.exit(suman_constants_1.constants.EXIT_CODES.SUMAN_PRE_NOT_FOUND_IN_YOUR_PROJECT);
        }
        iocFn = function () {
            return { dependencies: {} };
        };
    }
    let integrantPostFn;
    try {
        p = path.resolve(_suman.sumanHelperDirRoot + '/suman.once.post.js');
        integrantPostFn = require(p);
        integrantPostFn = integrantPostFn.default || integrantPostFn;
    }
    catch (err) {
        _suman.log.warning(`Could not load ${chalk_1.default.bold('<suman.once.post.js>')} file at path "${p}".`);
        if (!/Cannot find module/i.test(err.message)) {
            _suman.log.error(err.stack);
            return process.exit(1);
        }
        if (sumanOpts.strict) {
            process.exit(suman_constants_1.constants.EXIT_CODES.SUMAN_PRE_NOT_FOUND_IN_YOUR_PROJECT);
        }
        integrantPostFn = function () {
            return { dependencies: {} };
        };
    }
    let iocStaticFn;
    try {
        p = path.resolve(_suman.sumanHelperDirRoot + '/suman.ioc.static.js');
        iocStaticFn = require(p);
        iocStaticFn = iocStaticFn.default || iocStaticFn;
    }
    catch (err) {
        _suman.log.warning(`Could not load ${chalk_1.default.bold('<suman.ioc.static.js>')} file at path "${p}".`);
        if (!/Cannot find module/i.test(err.message)) {
            _suman.log.error(err.stack);
            return process.exit(1);
        }
        if (sumanOpts.strict) {
            process.exit(suman_constants_1.constants.EXIT_CODES.SUMAN_PRE_NOT_FOUND_IN_YOUR_PROJECT);
        }
        iocStaticFn = function () {
            return { dependencies: {} };
        };
    }
    try {
        assert(typeof integrantPostFn === 'function', ' => Your suman.once.pre.js file needs to export a function.');
        assert(typeof integrantPreFn === 'function', ' => Your suman.once.pre.js file needs to export a function.');
        assert(typeof iocStaticFn === 'function', ' => Your suman.once.pre.js file needs to export a function.');
        assert(typeof iocFn === 'function', ' => Your suman.ioc.js file does not export a function. Please fix this situation.');
    }
    catch (err) {
        _suman.log.error(chalk_1.default.magenta(err.stack));
        process.exit(suman_constants_1.constants.EXIT_CODES.SUMAN_HELPER_FILE_DOES_NOT_EXPORT_EXPECTED_FUNCTION);
    }
    return loadedSharedObjects = {
        globalHooksFn: _suman.globalHooksFn = globalHooksFn,
        iocFn: _suman.sumanIoc = iocFn,
        iocStaticFn: _suman.iocStaticFn = iocStaticFn,
        integrantPreFn: _suman.integrantPreFn = integrantPreFn,
        integrantPostFn: _suman.integrantPostFn = integrantPostFn
    };
};
let loaded = false;
exports.vetPaths = function (paths) {
    if (loaded) {
        return;
    }
    loaded = true;
    const projectRoot = _suman.projectRoot;
    paths.forEach(function (p) {
        p = path.isAbsolute(p) ? p : path.resolve(projectRoot + '/' + p);
        const shared = su.findSharedPath(p, projectRoot);
        if (String(shared) !== String(projectRoot)) {
            if (!_suman.sumanOpts.fforce) {
                console.error('Looks like you issued the Suman command from the wrong directory, ' +
                    'please cd to the relevant project.\n' +
                    ' => It appears that you wanted to execute Suman on this path => "' + chalk_1.default.magenta(p) + '"\n' +
                    ' But your current working directory is => "' + chalk_1.default.cyan(process.cwd()) + '"\n' +
                    ' If you think this message is totally wrong and you\'d like to ignore it, use the --fforce option.\n' +
                    ' However, most likely you will end up using the <suman-helpers-dir> from the wrong project\n' +
                    ' and end up writing to log files in the wrong project.');
            }
        }
    });
};
let fatalRequestReplyCallable = true;
exports.fatalRequestReply = function (obj, $cb) {
    const sumanOpts = _suman.sumanOpts || {};
    try {
        if (obj && obj.data && obj.data.msg) {
            _suman.log.error(chalk_1.default.magenta('Fatal request reply message => '), obj.data.msg);
        }
        else {
            _suman.log.error(chalk_1.default.magenta('Fatal request reply message => '), obj && util.inspect(obj.data || obj));
        }
    }
    catch (err) {
        _suman.log.error(err.message);
    }
    try {
        if (window.__karma__) {
            return process.nextTick($cb);
        }
    }
    catch (err) {
    }
    if (fatalRequestReplyCallable) {
        fatalRequestReplyCallable = false;
    }
    else {
        return process.nextTick($cb);
    }
    const cb = su.once(null, $cb);
    _suman.uncaughtExceptionTriggered = obj;
    if (sumanOpts.$forceInheritStdio) {
        return process.nextTick(cb);
    }
    if (!_suman.usingRunner) {
        return process.nextTick(cb);
    }
    let client = socketio_child_client_1.getClient();
    const FATAL = suman_constants_1.constants.runner_message_type.FATAL;
    const FATAL_MESSAGE_RECEIVED = suman_constants_1.constants.runner_message_type.FATAL_MESSAGE_RECEIVED;
    const to = setTimeout(cb, 2500);
    client.once(FATAL_MESSAGE_RECEIVED, function () {
        clearTimeout(to);
        process.nextTick(cb);
    });
    console.log('client sent fatal message to runner; waiting for response from runner...');
    obj.childId = process.env.SUMAN_CHILD_ID;
    client.emit(FATAL, obj);
};
exports.findSumanServer = function (serverName) {
    const sumanConfig = _suman.sumanConfig;
    let server = null;
    let hostname = os.hostname();
    if (sumanConfig.servers && serverName) {
        if (sumanConfig.servers[serverName]) {
            server = sumanConfig.servers[serverName];
        }
        else {
            throw new Error('Suman usage error => Bad server name ("' + serverName + '"), it does not match any ' +
                'properties on the servers properties in your suman.conf.js file.');
        }
    }
    else if (sumanConfig.servers && sumanConfig.servers[hostname]) {
        server = sumanConfig.servers[hostname];
        rb.emit(String(suman_events_1.events.USING_SERVER_MARKED_BY_HOSTNAME), hostname, server);
    }
    else if (sumanConfig.servers && sumanConfig.servers['*default']) {
        server = sumanConfig.servers['*default'];
        rb.emit(String(suman_events_1.events.USING_DEFAULT_SERVER), '*default', server);
    }
    else {
        server = Object.freeze({ host: '127.0.0.1', port: 6969 });
        rb.emit(String(suman_events_1.events.USING_FALLBACK_SERVER), server);
    }
    if (!server.host)
        throw new Error('no suman-server host specified.');
    if (!server.port)
        throw new Error('no suman-server port specified.');
    return server;
};
exports.makeOnSumanCompleted = function (suman) {
    return function onSumanCompleted(code, msg) {
        suman.sumanCompleted = true;
        process.nextTick(function () {
            suman.logFinished(code || 0, msg, function (err, val) {
                if (_suman.sumanOpts.check_memory_usage) {
                    _suman.log.error('Maximum memory usage during run => ' + util.inspect({
                        heapTotal: _suman.maxMem.heapTotal / 1000000,
                        heapUsed: _suman.maxMem.heapUsed / 1000000
                    }));
                }
                results.push(val);
                suiteResultEmitter.emit('suman-completed');
            });
        });
    };
};
exports.cloneError = function (err, newMessage, strip) {
    const obj = {};
    obj.message = newMessage || `Suman implementation error: "newMessage" is not defined. Please report: ${suman_constants_1.constants.SUMAN_ISSUE_TRACKER_URL}.`;
    let temp;
    if (strip !== false) {
        temp = su.createCleanStack(String(err.stack || err));
    }
    else {
        temp = String(err.stack || err).split('\n');
    }
    temp[0] = newMessage;
    obj.message = newMessage;
    obj.stack = temp.join('\n');
    return obj;
};
exports.parseArgs = function (args, fnIsRequired) {
    let [desc, opts, arr, fn] = args;
    if (arr && fn) {
        throw new Error('Suman usage error. Please define either an array or callback.');
    }
    let arrayDeps;
    if (arr) {
        if (typeof arr[arr.length - 1] === 'function') {
            fn = arr[arr.length - 1];
            arrayDeps = arr.slice(0, -1);
        }
        else {
            arrayDeps = arr.slice(0);
        }
    }
    if (fnIsRequired) {
        assert.equal(typeof fn, 'function', ' Suman usage error => ' +
            'You need to pass a function as the last argument to the array.');
    }
    desc = desc || (fn ? fn.name : '(suman unknown name)');
    arrayDeps = arrayDeps || [];
    return {
        arrayDeps,
        args: [desc, opts, fn]
    };
};
exports.evalOptions = function (arrayDeps, opts) {
    const iocDeps = [];
    const preVal = arrayDeps.filter(function (a) {
        if (typeof a === 'string') {
            if (/.*:.*/.test(a)) {
                return a;
            }
            if (/:/.test(a)) {
                _suman.log.warning('Looks like you have a bad value in your options as strings =>', util.inspect(arrayDeps));
                return;
            }
            iocDeps.push(a);
        }
        else if (su.isObject(a)) {
            Object.assign(opts, a);
        }
        else {
            _suman.log.warning('You included an unexpected value in the array =>', util.inspect(arrayDeps));
        }
    });
    const toEval = `(function(){return {${preVal.join(',')}}})()`;
    try {
        const obj = eval(toEval);
        Object.assign(opts, obj);
    }
    catch (err) {
        console.error('\n');
        _suman.log.error('Could not evaluate the options passed via strings => ', util.inspect(preVal));
        _suman.log.error('Suman will continue optimistically.');
        _suman.log.error(err.stack || err);
        console.error('\n');
    }
    return iocDeps;
};
