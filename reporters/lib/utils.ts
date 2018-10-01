'use strict';

//dts
import {ISumanOpts} from "suman-types/dts/global";
import {IExpectedCounts, IReporterLoadFn, IReporterLoadFnPre} from "suman-types/dts/reporters";
import EventEmitter = NodeJS.EventEmitter;
import {IRet} from "suman-types/dts/reporters";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//npm
import chalk from 'chalk';
import su = require('suman-utils');


/////////////////////////////////////////////////////////////////////////////////////

export interface FooBar {
  dummy: string
}

const loggers = {} as any;
const calledReporters = {} as any;

export const getLogger = function (reporterName: string) {

  if (loggers[reporterName]) {
    return loggers[reporterName];
  }

  reporterName = reporterName || `browser-reporting`;
  let stdReporterName = ` [suman '${reporterName}'] `;

  return loggers[reporterName] = {
    info: console.log.bind(console, chalk.gray.bold(stdReporterName)),
    warning: console.error.bind(console, chalk.yellow(stdReporterName)),
    error: console.error.bind(console, chalk.red(stdReporterName)),
    good: console.error.bind(console, chalk.cyan(stdReporterName)),
    veryGood: console.log.bind(console, chalk.green(stdReporterName))
  }

};

export const wrapReporter = function (reporterName: string, fn: IReporterLoadFn): IReporterLoadFnPre {

  if (calledReporters[reporterName]) {
    console.error(new Error(`"${wrapReporter.name}" called more than once for reporter with name ${reporterName}`).stack);
  }

  calledReporters[reporterName] = true;
  const log = getLogger(reporterName);

  if (su.vgt(5)) {
    log.info(`file was loaded for reporter with name '${reporterName}'.`)
  }

  const retContainer = {
    ret: null as IRet
  };

  return function (s, sumanOpts, expectations, client) {

    if (retContainer.ret) {
      // defensive programming construct, yay
      log.warning(`implementation warning => "${reporterName}" loaded more than once.`);
      return retContainer.ret;
    }

    const results = {
      n: 0,
      passes: 0,
      failures: 0,
      skipped: 0,
      stubbed: 0
    };

    if (su.vgt(5)) {
      log.info(`loading ${reporterName}.`);
    }

    if (!sumanOpts) {
      sumanOpts = {} as ISumanOpts;
      log.error('Suman implementation warning, no sumanOpts passed to reporter.');
    }

    return fn.apply(null, [retContainer, results, s, sumanOpts, expectations, client]);
  }

};
