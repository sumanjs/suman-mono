'use strict';

import chalk from 'chalk';
import {events} from 'suman-events';
import su = require('suman-utils');
import EE = require('events');
import path = require('path');
import log from './logger';

///////////////////////////////////////////////////////////////////////////////////////

export interface IFooBar {
  dummy: string
}


export const tb = new EE();


export const options: Array<any> = [
  {
    names: ['reporter', 'reporters', 'reporter-paths', 'reporters-path'],
    type: 'string',
    help: 'Choose a desired reporter by name or path.'
  }

];


export const registerReporter = function (projectRoot: string, name: string) {

  if(su.vgt(5)){
    log.info(`Suman-R is registering reporter with name => "${name}".`);
  }
 
  
  let reporterFn, pth;

  try {
    pth = require.resolve(name);
    su.vgt(5) && log.info('reporter being loaded with the following path:');
    su.vgt(5) && log.info(pth);
    reporterFn = require(pth);
  }
  catch (err) {
    try {
      pth = `suman-reporters/modules/${name}`;
      su.vgt(5) && log.info(`reporter being loaded with the following resolved name '${chalk.magenta(pth)}'.`);
      reporterFn = require(pth);
    }
    catch (err) {
      pth = path.resolve(projectRoot + `/${name}`);
      su.vgt(5) && log.info(`reporter being loaded with the following resolved name '${chalk.magenta(pth)}'.`);
      reporterFn = require(pth);
    }
  }

  if (!reporterFn) {
    throw new Error(`suman-r could not load a reporter using the following name '${name}.'`);
  }

  reporterFn = reporterFn.loadReporter || reporterFn.default || reporterFn;
  reporterFn.call(null, tb, {});
};
