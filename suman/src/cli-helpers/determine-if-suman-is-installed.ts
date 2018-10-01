'use strict';

import {ISumanConfig, ISumanOpts} from "suman-types/dts/global";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import assert = require('assert');
const path = require('path');
const fs = require('fs');

//npm
import su = require('suman-utils');
import chalk from 'chalk';

//project
const _suman = global.__suman = (global.__suman || {});

//////////////////////////////////////////////////////////////////////////////////////

export const vetLocalInstallations = function (sumanConfig: ISumanConfig, opts: ISumanOpts, projectRoot: string) {

  let sumanInstalledLocally = false,
    sumanInstalledAtAll = false,
    sumanServerInstalled = false,
    sumanIsSymlinkedLocally = false,
    sumanPath1: string,
    sumanPath2: string;

  const sumanNodeModulesPath = path.resolve(projectRoot + '/node_modules/suman');

  try {
    if (fs.lstatSync(sumanNodeModulesPath).isSymbolicLink()) {
      sumanIsSymlinkedLocally = true;
      if (opts.verbosity > 4) {
        _suman.log.info(chalk.yellow('Note that Suman is installed locally as a symlinked directory (which is fine).'));
      }
    }
  }
  catch (err) {

  }

  try {
    sumanPath1 = require.resolve(sumanNodeModulesPath);
    su.vgt(6) && _suman.log.info('Suman installation resolved at this location:', chalk.bold(sumanPath1));
    sumanInstalledLocally = true;
  } catch (e) {
    sumanInstalledLocally = false;
  }

  if (!sumanInstalledLocally) {
    if (opts.verbosity > 4) {
      _suman.log.info(chalk.yellow('Note that Suman is not installed locally, you may wish to run "$ suman --init"'));
    }
  }

  try {
    sumanPath2 = require.resolve('suman');
    sumanInstalledAtAll = true;
    if(sumanPath1 !== sumanPath2){
      su.vgt(6) && _suman.log.info('Suman installation resolved at this location:', chalk.bold(sumanPath2));
    }

  } catch (e) {
    sumanInstalledAtAll = false;
  }

  if (!sumanInstalledAtAll) {
    if (!sumanIsSymlinkedLocally && opts.verbosity > 2) {
      _suman.log.warning(chalk.yellow('Note that Suman is not installed at all, you may wish to run "$ suman --init"'));
    }
  }

  try {
    require.resolve('suman-server');
    sumanServerInstalled = true;
  }
  catch (err) {
    sumanServerInstalled = false;
    if (opts.verbosity > 2) {
      _suman.log.info(chalk.yellow('note that "suman-server" package is not yet installed.'));
    }
  }

  return {
    sumanServerInstalled,
    sumanInstalledLocally,
    sumanInstalledAtAll
  }

};
