'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const assert = require("assert");
const path = require("path");
const fs = require("fs");
const logging_1 = require("./logging");
const chalk = require("chalk");
const async = require("async");
const su = require("suman-utils");
const picomatch = require("picomatch");
exports.getAlwaysIgnore = function () {
    return [
        '.DS_Store',
        '/.idea/',
        '___jb_old___',
        '___jb_tmp___',
        '/node_modules/',
        '/.git/',
        '\\.log$',
        '/logs/',
        '/@target/',
        '\.txt$'
    ];
};
const normalizeGlobPath = function (value) {
    return value.replace(/\\/g, '/');
};
const addUnique = function (values, value) {
    if (values.indexOf(value) < 0) {
        values.push(value);
    }
};
const testRegExp = function (regex, value) {
    regex.lastIndex = 0;
    return regex.test(value);
};
exports.getChokidarWatchPlan = function (includes, cwd) {
    const root = path.resolve(cwd || process.cwd());
    const watchPaths = [];
    const positiveMatchers = [];
    const negativeMatchers = [];
    includes.forEach(function (include) {
        if (include instanceof RegExp) {
            addUnique(watchPaths, '.');
            positiveMatchers.push(function (filePath) {
                const absolutePath = path.resolve(root, filePath);
                const relativePath = path.relative(root, absolutePath);
                return testRegExp(include, filePath) ||
                    testRegExp(include, relativePath) ||
                    testRegExp(include, absolutePath);
            });
            return;
        }
        const normalizedPattern = normalizeGlobPath(include);
        const scan = picomatch.scan(normalizedPattern);
        if (!scan.isGlob) {
            addUnique(watchPaths, include);
            const literalPath = path.resolve(root, include);
            positiveMatchers.push(function (filePath) {
                const absolutePath = path.resolve(root, filePath);
                return absolutePath === literalPath || absolutePath.indexOf(literalPath + path.sep) === 0;
            });
            return;
        }
        let matcherPattern = scan.negated ? normalizedPattern.substring(scan.start) : normalizedPattern;
        if (!path.isAbsolute(include) && matcherPattern.indexOf('./') === 0) {
            matcherPattern = matcherPattern.substring(2);
        }
        const matcher = picomatch(matcherPattern);
        const matchesGlob = function (filePath) {
            const absolutePath = path.resolve(root, filePath);
            const relativePath = normalizeGlobPath(path.relative(root, absolutePath));
            return matcher(path.isAbsolute(include) ? normalizeGlobPath(absolutePath) : relativePath);
        };
        if (scan.negated) {
            negativeMatchers.push(matchesGlob);
        }
        else {
            addUnique(watchPaths, scan.base || '.');
            positiveMatchers.push(matchesGlob);
        }
    });
    if (watchPaths.length < 1) {
        watchPaths.push('.');
    }
    const isIncluded = function (filePath) {
        const hasPositiveMatch = positiveMatchers.length < 1 ||
            positiveMatchers.some(function (matcher) {
                return matcher(filePath);
            });
        return hasPositiveMatch && !negativeMatchers.some(function (matcher) {
            return matcher(filePath);
        });
    };
    return {
        paths: watchPaths,
        isIncluded,
        ignored: function (filePath, stats) {
            return Boolean(stats && stats.isFile() && !isIncluded(filePath));
        }
    };
};
const sig = ['@run.sh', '@transform.sh', '@config.json', 'suman.conf.js'];
exports.isPathMatchesSig = function (basename) {
    return sig.some(function (v) {
        return String(basename) === String(v);
    });
};
exports.getWatchObj = function (projectRoot, sumanOpts, sumanConfig) {
    if (!sumanConfig) {
        const p = path.resolve(projectRoot + '/suman.conf.js');
        logging_1.default.warning(`new suman.conf.js path => ${p}`);
        delete require.cache[p];
        logging_1.default.warning(`deleted suman.conf.js cache`);
        sumanConfig = require(p);
        logging_1.default.warning(`re-required suman.conf.js file.`);
    }
    let watchObj = null;
    if (sumanOpts.watch_per) {
        assert(su.isObject(sumanConfig.watch), chalk.red(' => Suman usage error => suman.conf.js needs a "watch" property that is an object.'));
        assert(su.isObject(sumanConfig.watch.per), chalk.red(' => Suman usage error => suman.conf.js "watch" object, needs property called "per" that is an object.'));
        watchObj = sumanConfig.watch.per[sumanOpts.watch_per];
        assert(su.isObject(watchObj), chalk.red(`Suman usage error => key "${sumanOpts.watch_per}" does not exist on the {suman.conf.js}.watch.per object.`));
    }
    return {
        watchObj,
        sumanConfig
    };
};
exports.find = function (getTransformPaths, cb) {
    async.map(Object.keys(getTransformPaths), function (key, cb) {
        if (!getTransformPaths[key]['@config.json']) {
            return process.nextTick(cb);
        }
        const p = path.resolve(key + '/@config.json');
        fs.readFile(p, 'utf8', function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                cb(null, { path: p, data: JSON.parse(data) });
            }
            catch (err) {
                cb(err);
            }
        });
    }, cb);
};
const $exports = module.exports;
exports.default = $exports;
