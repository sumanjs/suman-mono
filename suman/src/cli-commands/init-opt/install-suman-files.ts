'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const cp = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const util = require('util');

//npm
const async = require('async');
import chalk from 'chalk';

const chmodr = require('chmodr');
const debug = require('suman-debug');

//project
const _suman = global.__suman = (global.__suman || {});
const {constants} = require('../../config/suman-constants');
const sumanUtils = require('suman-utils');
const debugInit = debug('s:init');

/////////////////////////////////////////////////////////////////////////////

interface ICopyableItem {
  src: string,
  dest: string
}

//////////////////////////////////////////////////////////////////////////////

export const writeSumanFiles = function (newSumanHelperDirAbsPath: string, prependToSumanConf: string,
                                         newSumanHelperDir: string, projectRoot: string) {
  
  return function installSumanFiles(cb: Function) {
    
    async.autoInject({
        
        createSumanDir: function (cb: Function) {
          //if dir exists an error will be thrown
          fs.mkdir(newSumanHelperDirAbsPath, 0o777, cb);
        },
        
        copyDefaultFiles: function (createSumanDir: any, cb: Function) {
          async.each([
            {
              src: 'default-conf-files/suman.default.conf.js',
              dest: prependToSumanConf + 'suman.conf.js'
            },
            {
              src: 'default-conf-files/suman.default.ioc.static.js',
              dest: newSumanHelperDir + '/suman.ioc.static.js'
            },
            {
              src: 'default-conf-files/suman.default.ioc.js',
              dest: newSumanHelperDir + '/suman.ioc.js'
            },
            {
              //TODO: suman.order.js should be suman.constaints.js ?
              src: 'default-conf-files/suman.default.order.js',
              dest: newSumanHelperDir + '/suman.order.js'
            },
            {
              src: 'default-conf-files/suman.default.once.pre.js',
              dest: newSumanHelperDir + '/suman.once.pre.js'
            },
            {
              src: 'default-conf-files/suman.default.once.post.js',
              dest: newSumanHelperDir + '/suman.once.post.js'
            },
            {
              src: 'default-conf-files/suman.default.globals.js',
              dest: newSumanHelperDir + '/suman.globals.js'
            },
            {
              src: 'default-conf-files/suman.default.hooks.js',
              dest: newSumanHelperDir + '/suman.hooks.js'
            },
            {
              src: 'default-conf-files/suman.default.readme',
              dest: newSumanHelperDir + '/README.md'
            }
          
          ], function (item: ICopyableItem, cb: Function) {
            
            fs.createReadStream(path.resolve(__dirname + '/../../' + item.src))
            .pipe(fs.createWriteStream(path.resolve(projectRoot + '/' + item.dest)))
            .once('error', cb).once('finish', cb);
            
          }, cb);
        },
        
        createMetaDir: function (createSumanDir: any, cb: Function) {
          fs.mkdir(path.resolve(newSumanHelperDirAbsPath + '/.meta'), 0o777, function (err: Error) {
            
            if (err) {
              if (!String(err).match(/EEXIST/i)) {
                return cb(err);
              }
            }
            
            const msg = 'Readme file here primarily for version control stability.';
            
            async.forEachOf([
                'README.md'
              ],
              function (item: string, index: number, cb: Function) {
                let p = path.resolve(newSumanHelperDirAbsPath + '/.meta/' + item);
                fs.writeFile(p, msg, cb);
              }, cb);
          });
        },
        
        createLogsDir: function (createSumanDir: any, cb: Function) {
          fs.mkdir(path.resolve(newSumanHelperDirAbsPath + '/logs'), 0o777, function (err: Error) {
            if (err) {
              if (!String(err).match(/EEXIST/)) {
                return cb(err);
              }
            }
            //we also just overwrite stdio logs
            const msg1 = 'Readme file here primarily for version control stability\n';
            const msg2 = 'Suman recommends that you tail the files in this directory when you\'re developing tests => most useful thing to do is to tail the runner-debug.log when running tests with the Suman runner,' +
              'this is because accessing the individual test errors is less transparent due to the nature of child-processes/subprocesses)';
            const msg3 = msg1 + '\n' + msg2;
            
            async.forEachOf([
              'README.md',
              'watcher-output.log',
              'test-debug.log',
              'server.log',
              'runner-debug.log'
            ], function (item: string, index: number, cb: Function) {
              let p = path.resolve(newSumanHelperDirAbsPath + '/logs/' + item);
              fs.writeFile(p, index === 0 ? msg3 : msg2, cb);
            }, cb);
          });
        },
        
        chownDirs: function (createLogsDir: any, createSumanDir: any, cb: Function) {
          chmodr(newSumanHelperDirAbsPath, 0o777, cb);
        }
      },
      cb);
  }
  
};
