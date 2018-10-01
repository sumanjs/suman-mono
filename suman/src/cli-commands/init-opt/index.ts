'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import fs = require('fs');
import cp = require('child_process');
import path = require('path');
import os = require('os');
import util = require('util');

//npm
const async = require('async');
const flattenDeep = require('lodash.flattendeep');
import chalk from 'chalk';
import {IGlobalSumanObj, ISumanOpts} from "suman-types/dts/global";
import su = require('suman-utils');
const chmodr = require('chmodr');
const semver = require('semver');

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {makeGetLatestSumanVersion} from './get-latest-suman-version';
import {makeNPMInstall} from './install-suman';
import {writeSumanFiles} from './install-suman-files';
import {determineIfReadlinkAvail} from './determine-if-readlink-avail';
import helpers = require('./init-helpers');

/////////////////////////////////////////////////////////////////////////////////////////////////

const logPermissonsAdvice = helpers.logPermissonsAdvice;

////////////////////////////////////////////////////////////////////////////////////////////////

export const run = (opts: ISumanOpts, projectRoot: string, cwd: string) => {

  const force = opts.force;
  const fforce = opts.fforce;

  if (!projectRoot) {
    _suman.log.error('\n');
    _suman.log.error(chalk.red('Suman installation fatal error => Suman cannot find the root of your project,' +
      ' given your current working directory.'));
    _suman.log.error(chalk.red('Please ensure that you are issuing the installation command from the root of your project.'));
    _suman.log.error(chalk.red('Note: You will need to run "$ npm init", or create a package.json file, ' +
      'if your project does not have a package.json file yet.'));
    _suman.log.error('\n');
    return;
  }

  if (!force && !process.env.SUDO_UID) {
    logPermissonsAdvice();
  }

  let err;

  try {
    require(path.resolve(projectRoot + '/package.json'));
  }
  catch (err) {
    if (!fforce) {
      _suman.log.info(' => Suman message => there is no package.json file in your working directory.');
      _suman.log.info(' => Perhaps you wish to run ' + chalk.yellow('"$ npm init"') + ' first, or perhaps you are in the wrong directory?');
      _suman.log.info(' => To override this use the --fforce option.');

      if (projectRoot) {
        _suman.log.info('\nIn other words, the current working directory is as follows:');
        _suman.log.info(chalk.cyan(cwd));
        _suman.log.info('...but the root of your project appears to be at this path:');
        _suman.log.info(chalk.magenta(projectRoot), '\n\n');
      }

      return;
    }
  }

  let resolved = false;
  let resolvedLocal = false;
  let pkgDotJSON: Object;

  try {
    //TODO: what if it recognizes global modules as well as local ones?
    require.resolve('suman');
    resolved = true;
    pkgDotJSON = require(path.resolve(projectRoot + '/node_modules/suman/package.json'));
    resolvedLocal = true;
  }
  catch (e) {
    err = e;
  }

  if (err) {
    _suman.log.info('Suman will attempt to install itself to the project in your current working directory.');
  }
  else {
    //TODO: only write out suman.x.js if it doesn't already exist
    if (!force && !fforce) {
      _suman.log.info(' => Suman init message => Suman NPM package is already installed locally.');
      _suman.log.info(chalk.magenta(' => Use the --force option to update to the latest version', '\n\n'));
      // return;
    }
  }

  let conf,
    timestamp = String(Date.now()),
    prependToSumanConf = '',
    appendToSumanHelpersDir = '',
    sumanHelperDirFound = false,
    sumanAlreadyInittedBecauseConfFileExists = false;

  let potentialPathToConf;
  try {
    potentialPathToConf = path.resolve(projectRoot + '/suman.conf.js');
    conf = require(potentialPathToConf);
    sumanAlreadyInittedBecauseConfFileExists = true;
    _suman.log.warning(' => During --init routine, we have found a pre-existing suman.conf.js file at path ' +
      'file at path => ', potentialPathToConf);
  }
  catch (err) {
    _suman.log.info(' => Did not find a suman.conf.js (a good thing, since we are initting) ' +
      'file at path => ', potentialPathToConf || (' => implementation error => ' + (err.stack || err)));
  }

  try {
    if (!fforce) {
      const p = path.resolve(projectRoot + '/' + (conf ? (conf.sumanHelpersDir || '/suman') : '/suman' ));
      _suman.log.info(' => Looking for existing suman helpers dir here => "' + p + '"');
      const files = fs.readdirSync(p);
      sumanHelperDirFound = true;
      files.forEach(function (file: string) {
        if (!sumanAlreadyInittedBecauseConfFileExists) {
          sumanAlreadyInittedBecauseConfFileExists = true;
          _suman.log.info(chalk.magenta.bold(' => Looks like this project has already ' +
            'been initialized as a Suman project.'));
        }
        _suman.log.info(' => Your ./suman directory already contains => ' + file);
      });
    }

  }
  catch (err) {
    _suman.log.error(' => Could not find your suman helpers dir => We will create a new one.');
  }

  if (sumanAlreadyInittedBecauseConfFileExists && !force) {
    _suman.log.info(' => Looks like Suman has already been initialized in this project ' +
      '- do you want to re-initialize Suman in this project?');
    _suman.log.info(chalk.cyan(' => If you would like to install the latest Suman files with the latest defaults, ' +
      'you can re-run "$ suman --init" with the --force option.'));
    _suman.log.info(chalk.red(' => Before you use --force/--fforce options, it\'s always a good idea to run a commit/tag with your version control system.') + '\n');
    _suman.log.info(chalk.red.bold(' => Should you choose to reinitialize, Suman will write out folders with a timestamp for uniqueness,\n    and will not delete' +
      ' any of your files. It is very safe to reinitialize Suman. Please see these instructions => ***'), '\n\n');
    return process.exit(1);
  }

  if (sumanAlreadyInittedBecauseConfFileExists) {
    prependToSumanConf = timestamp + '-';
  }

  if (sumanHelperDirFound) {
    appendToSumanHelpersDir = '-' + timestamp;
  }

  const newSumanHelperDir = '/.suman' + appendToSumanHelpersDir;
  const newSumanHelperDirAbsPath = path.resolve(projectRoot + '/.suman' + appendToSumanHelpersDir);

  async.series([

      function installFiles(cb: Function) {

        async.parallel([

          writeSumanFiles(newSumanHelperDirAbsPath, prependToSumanConf, newSumanHelperDir, projectRoot),
          makeGetLatestSumanVersion(pkgDotJSON, projectRoot),
          determineIfReadlinkAvail(pkgDotJSON, projectRoot)

        ], cb);

      },

      makeNPMInstall(resolvedLocal, pkgDotJSON, projectRoot)

    ],

    function (err: Error, results: Array<any>) {

      flattenDeep(results).forEach(function (item: string) {
        item && _suman.log.info('\n' + chalk.bgYellow.black(util.inspect(item)) + '\n');
      });

      if (err) {
        _suman.log.error('\n => Suman fatal installation error => ', (err.stack || err));
        logPermissonsAdvice();
        return process.exit(1);
      }

       if (results.npmInstall) {
        _suman.log.info(chalk.bgYellow.black.bold(' => Suman message => NPM error, most likely a permissions error.'));
        logPermissonsAdvice();
      }
      else {
        _suman.log.info(chalk.bgBlue.white.bold(' => Suman message => Suman was successfully installed locally.'));
      }

      _suman.log.info(['=> Notice the new directory called "suman" in the root of your project.',
        'This directory houses log files used by Suman for debugging tests running',
        'in child processes as well as Suman helper files. Suman recommends moving the ',
        '"suman" directory inside your <test-dir> and renaming it "_suman" or ".suman".',
        'If you elect this option, you should change your suman.conf.js file according to these instructions:',
        ' => http://sumanjs.org/tutorial-01-getting-started.html'
      ]
      .map((l, index, a) => {
        return (index < a.length - 1) ? chalk.bgBlack.cyan(l) : chalk.bgBlack.yellow(l);
      })
      .join('\n'), '\n\n');

      process.exit(0);
    });

};
