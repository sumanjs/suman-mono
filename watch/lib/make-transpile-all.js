'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const util = require("util");
const path = require("path");
const cp = require("child_process");
const fs = require("fs");
const async = require("async");
const su = require("suman-utils");
const logging_1 = require("./logging");
const cleanStdio = function (stdio) {
    return String(stdio).trim().split('\n').map(l => String(l).trim()).filter(i => i).join('\n');
};
exports.makeTranspileAll = function (watchOpts, projectRoot) {
    return function (transformPaths, cb) {
        const sumanConfig = require(path.resolve(projectRoot + '/suman.conf.js'));
        const filtered = transformPaths.filter(function (t) {
            return t.bashFilePath;
        });
        async.mapLimit(filtered, 4, function (t, cb) {
            su.findApplicablePathsGivenTransform(sumanConfig, t.basePath, function (err, results) {
                if (err) {
                    return cb(err);
                }
                su.makePathExecutable(t.bashFilePath, function (err) {
                    if (err) {
                        return cb(err);
                    }
                    console.log('tttt', util.inspect(t));
                    const uniqueResults = results.filter(function (r, i) {
                        return results.indexOf(r) === i;
                    });
                    const k = cp.spawn('bash', [], {
                        detached: false,
                        cwd: projectRoot || process.cwd(),
                        env: Object.assign({}, process.env, {
                            SUMAN_TEST_PATHS: JSON.stringify(uniqueResults),
                            SUMAN_TRANSFORM_ALL_SOURCES: 'yes'
                        })
                    });
                    fs.createReadStream(t.bashFilePath).pipe(k.stdin);
                    let timedout = false;
                    let onTimeout = function () {
                        timedout = true;
                        k.kill('SIGINT');
                        cb(new Error(`transform all process timed out for the @transform.sh file at path "${t}".`), {
                            path: t,
                            stdout: cleanStdio(stdout),
                            stderr: cleanStdio(stderr)
                        });
                    };
                    const to = setTimeout(onTimeout, 300000);
                    k.once('error', function (e) {
                        logging_1.default.error(`spawn error for path => "${t}" =>\n${e.stack || e}`);
                    });
                    let stdout = '';
                    k.stdout.setEncoding('utf8');
                    k.stdout.on('data', function (d) {
                        stdout += d;
                    });
                    let stderr = '';
                    k.stderr.setEncoding('utf8');
                    k.stderr.on('data', function (d) {
                        stderr += d;
                    });
                    k.once('exit', function (code) {
                        clearTimeout(to);
                        if (!timedout) {
                            cb(null, {
                                path: t,
                                code: code,
                                stdout: cleanStdio(stdout),
                                stderr: cleanStdio(stderr)
                            });
                        }
                    });
                });
            });
        }, cb);
    };
};
