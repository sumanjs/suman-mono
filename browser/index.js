'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var process = require('suman-browser-polyfills/modules/process');
var global = require('suman-browser-polyfills/modules/global');
var fs = require("fs");
var path = require("path");
var su = require("suman-utils");
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var replaceStream = require('replacestream');
var async = require("async");
var _ = require("lodash");
var _suman = global.__suman = (global.__suman || {});
var webpackTemplatePath = path.resolve(__dirname + '/lib/html-templates/webpack.html');
var sumanTestContentRegex = /<suman-test-content>.*<\/suman-test-content>/;
var sumanLibRegex = /'<suman-build>'/;
var sumanTestRegex = /'<suman-test>'/;
var getTopHtml = function () {
    return [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="UTF-8">',
        '<title>Suman + Webpack Test</title>',
        '</head>',
        '<body>',
        '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.26.0/polyfill.js"></script>'
    ];
};
var getBottomHtml = function () {
    return [
        '</body>',
        '</html>'
    ];
};
var getEmbeddedScript = function (port, id, sumanConfigStr, sumanOptsStr) {
    var timestamp = Date.now();
    return [
        '<script>',
        "window.__suman = window.__suman || {};\n",
        "window.__suman.SUMAN_SOCKETIO_SERVER_PORT=" + port + ";\n",
        "window.__suman.SUMAN_CHILD_ID=" + id + ";\n",
        "window.__suman.usingRunner=true;\n",
        "window.__suman.timestamp=" + timestamp + ";\n",
        "window.__suman.sumanConfig=" + sumanConfigStr + ";\n",
        "window.__suman.sumanOpts=" + sumanOptsStr + ";\n",
        '</script>'
    ];
};
var getSumanLibScript = function (cb) {
    var p = path.resolve(__dirname + '/dist/suman.js');
    fs.readFile(p, 'utf8', function (err, data) {
        if (err) {
            return cb(err);
        }
        cb(null, [
            '<script>',
            String(data),
            '</script>'
        ]);
    });
};
var getWebpackBuild = function (sumanHelperDir) {
    return function (cb) {
        var p = path.resolve(sumanHelperDir + '/browser/builds/browser-tests.js');
        fs.readFile(p, 'utf8', function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, [
                '<script>',
                String(data),
                '</script>'
            ]);
        });
    };
};
exports.makeGetBrowserStream = function (sumanHelperDir, sumanConf, sumanOpts) {
    var sumanOptsStr = su.customStringify(sumanOpts);
    var sumanConfigStr = su.customStringify(sumanConf);
    return function getBrowserStream(port, id, cb) {
        async.parallel([
            getSumanLibScript,
            getWebpackBuild(sumanHelperDir)
        ], function (err, results) {
            if (err) {
                return cb(err);
            }
            var all = [
                getTopHtml(),
                getEmbeddedScript(port, id, sumanConfigStr, sumanOptsStr),
                results,
                getBottomHtml()
            ];
            var allStr = _.flattenDeep(all.reduce(function (a, b) { return a.concat(b); }, []));
            cb(null, allStr);
        });
    };
};
