'use strict';

//dts
import {ISumanConfig} from "suman-types/dts/global"

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//npm
import chalk from 'chalk';

///////////////////////////////////////////////////////////////////////////


export const log = {
  info: console.log.bind(console, 'suman-watch-plugins/info:'),
  good: console.log.bind(console, chalk.cyan('suman-watch-plugins:')),
  veryGood: console.log.bind(console, chalk.green('suman-watch-plugins:')),
  warning: console.log.bind(console, chalk.yellow.bold('suman-watch-plugins/warn:')),
  error: console.log.bind(console, chalk.red('suman-watch-plugins/error:')),
  newLine: function () {
    console.log();
  }
};

export default log;
