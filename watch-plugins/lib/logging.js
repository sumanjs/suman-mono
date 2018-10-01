'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var process = require('suman-browser-polyfills/modules/process');
var global = require('suman-browser-polyfills/modules/global');
var chalk_1 = require("chalk");
exports.log = {
    info: console.log.bind(console, 'suman-watch-plugins/info:'),
    good: console.log.bind(console, chalk_1.default.cyan('suman-watch-plugins:')),
    veryGood: console.log.bind(console, chalk_1.default.green('suman-watch-plugins:')),
    warning: console.log.bind(console, chalk_1.default.yellow.bold('suman-watch-plugins/warn:')),
    error: console.log.bind(console, chalk_1.default.red('suman-watch-plugins/error:')),
    newLine: function () {
        console.log();
    }
};
exports.default = exports.log;
