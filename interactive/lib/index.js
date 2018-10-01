'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const assert = require('assert');
const util = require('util');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

//npm
const async = require('async');
const colors = require('colors/safe');
const su = require('suman-utils');

//project
const _suman = global.__suman = (global.__suman || {});
const interactive = _suman.interactive = _suman.interactive || {};
const {log} = require('./logging');
const rejectionHandler = require('./interactive-rejection-handler');
const choices = require('./helpers/choices');


////////////////////////////////////////////////////////////////////////

process.on('warning', function (w) {
  if (su.weAreDebugging) {
    // if we are debugging, log all warnings
    console.warn(' => Suman interactive warning => ', w.stack || w);
  }
  else if (!(/deprecated/i.test(String(w)))) {
    //there were some really useless warnings about deprecation
    console.warn(' => Suman interactive warning => ', w.stack || w);
  }

});

//////////////////////////////////////////////////////

process.stdin.setMaxListeners(20);

///////////////////////////////////////////////////////


_suman.onBackspace = function (cb) {

  process.stdin.listeners('readable').forEach(function (fn) {
    if (process.stdin.listenerCount('readable') > 4)
      process.stdin.removeListener('readable', fn);
  });

  process.stdin.listeners('close').forEach(function (fn) {
    if (process.stdin.listenerCount('close') > 4)
      process.stdin.removeListener('close', fn);
  });

  process.stdin.listeners('keypress').forEach(function (fn) {
    if (process.stdin.listenerCount('keypress') > 4)
      process.stdin.removeListener('keypress', fn);
  });

  process.stdin.listeners('exit').forEach(function (fn) {
    if (process.stdin.listenerCount('exit') > 4)
      process.stdin.removeListener('exit', fn);
  });

  process.stdin.listeners('end').forEach(function (fn) {
    if (process.stdin.listenerCount('end') > 4)
      process.stdin.removeListener('end', fn);
  });

  process.nextTick(cb);
};

_suman._implementationError = function (msg) {
  msg = msg || '';
  msg = typeof msg === 'string' ? msg : util.inspect(msg);
  throw new Error(colors.red(' => Suman interactive internal implementation problem ' + (msg || '.')));
};

exports.start = function () {


  const testDir = _suman.sumanConfig.testDir;

  let rootDir;

  try {
    rootDir = path.resolve(_suman.projectRoot + '/' + testDir);
    if (!(fs.statSync(rootDir).isDirectory())) {
      throw new Error('Path given by => "' + rootDir + '" is not a directory');
    }
  }
  catch (err) {
    rootDir = _suman.projectRoot;
  }

  console.log('\n');
  const loadingMessage = colors.green.bold(' => Loading suman interactive mode...');
  console.log(loadingMessage);

  const cwd = path.resolve(process.env.HOME + '/.suman/global');

  async.parallel({

    installSumanInquirer: function (cb) {
      try {
        require.resolve('suman-inquirer');
        return process.nextTick(cb);
      }
      catch (err) {
        cp.exec('npm install suman-inquirer@latest', {
          cwd: cwd
        }, cb);
      }
    },

    installSumanInquirerDirectory: function (cb) {
      try {
        require.resolve('suman-inquirer-directory');
        return process.nextTick(cb);
      }
      catch (err) {
        cp.exec('npm install suman-inquirer-directory@latest', {
          cwd: cwd
        }, cb);
      }
    }

  }, function (err) {

    if (err) {
      throw err;
    }

    const inquirer = require('suman-inquirer');
    const inqDir = require('suman-inquirer-directory');
    inquirer.registerPrompt('directory', inqDir);

    const firstSetOfQuestions = [

      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        default: 0,
        onLeftKey: function () {
          console.warn('left key fired in top level!');
          _suman.onBackspace(start);
        },
        choices: Object.values(choices.topLevelOpts), //add empty option for formatting purposes
        when: function (d) {
          if (d.suman === false) {
            console.log('\n\n');
            console.log('\n => Confirmation was false...ok, we will exit then!');
            process.exit(1);
          }
          else {
            console.log('\n\n ---------------------------------------------------- \n\n');
            return true;
          }
        }
      }
    ];

    const secondSetOfQuestions = [
      {
        type: 'list',
        name: 'firstAction',
        message: 'What would you like to do?',
        onLeftKey: function () {
          console.warn('left key fired in generate list!');
          _suman.onBackspace(start);
        },
        default: 0,
        choices: fs.readdirSync(path.resolve(__dirname + '/generate-command')),
        when: function () {
          console.log('\n\n ----------------------------------------------------- \n\n');
          return true;
        }
      }
    ];

    function generateList(obj, onBackspace) {

      const dir = obj.firstAction;
      const root = path.resolve(__dirname + '/generate-command');
      const items = fs.readdirSync(root + '/' + dir);

      return inquirer.prompt([
        {
          type: 'list',
          name: 'secondAction',
          message: 'What would you like to do?',
          onLeftKey: function () {
            console.warn('left key fired in generate list!');
            _suman.onBackspace(onBackspace);

          },
          default: 0,
          choices: items.map(function (item) {
            return String(item).slice(0, -3);  // get rid of ".js"
          }),
          when: function () {
            console.log('\n\n ----------------------------------------------------- \n\n');
            return true;
          },
          filter: function (items) {
            return items;
            // return items.map(function (item) {
            //   return path.resolve(root + '/' + item);
            // });
          }
        }
      ])
      .then(function (answers) {
        return Object.assign(obj, answers);
      });
    }

    function secondSet() {

      return inquirer.prompt(secondSetOfQuestions).then(function (obj) {
        return thirdSet(obj, secondSet);
      });

    }

    function thirdSet(obj, cb) {

      const _thirdSet = thirdSet.bind(null, obj, cb);

      return generateList(obj, cb).then(function (obj) {

        const pth = path.resolve(__dirname + '/generate-command/' + obj.firstAction + '/' + obj.secondAction + '.js');

        return require(pth)({
          rootDir: rootDir
        }, _thirdSet);
      });

    }

    function start() {

      // process.stdin.removeAllListeners('keypress');
      // process.stdin.removeAllListeners('end');
      console.warn('readable count:', process.stdin.listenerCount('readable'));
      console.warn('keypress count:', process.stdin.listenerCount('keypress'));
      console.warn('keypress count:', process.stdin.listenerCount('keypress'));

      inquirer.restoreDefaultPrompts();

      inquirer.prompt(firstSetOfQuestions).then(function (respuestas) {
        if (respuestas.action === choices.topLevelOpts.GenerateCommand) {
          return secondSet(start);
        }
        else if (respuestas.action === choices.topLevelOpts.Learn) {
          throw new Error('Learn the Suman API is not implemented yet.');
        }
        else if (respuestas.action === choices.topLevelOpts.Troubleshoot) {
          throw new Error('Troubleshoot is not implemented yet.');
        }
        else {
          throw new Error('Action not recognized.');
        }
      })
      .catch(rejectionHandler);

    }

    start();

  });

};

exports.default = module.exports;



