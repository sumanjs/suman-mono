'use strict';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const path = require('path');
const util = require('util');
const os = require('os');
const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');
const tty = require('tty');

//npm
const tcpp = require('tcp-ping');
const socketio = require('socket.io-client');

//project
const _suman = global.__suman = (global.__suman || {});
const {findSumanServer} = require('../../helpers/find-suman-server');
const su = require('suman-utils');

/////////////////////////////////////////////////////////////////////

exports.run = function (obj, cb) {

  const projectRoot = _suman.projectRoot || su.findProjectRoot(process.cwd());

  obj = obj || {};

  cb = cb || function (err) {
      if (err) {
        console.error(err.stack || err);
      }
    };

  const $NODE_ENV = obj.$node_env || process.env.NODE_ENV;

  let sumanConfig;
  if (typeof obj.config === 'object') {   //TODO: do at least one more check here
    sumanConfig = obj.config;
  }
  else {
    sumanConfig = obj.configPath ? require(path.resolve(projectRoot + '/' + obj.configPath)) : null;
  }

  let server = findSumanServer(obj.serverName);

  if (!server) {
    let defaultConfig = require(path.resolve(__dirname + '/default-conf-files/suman.default.conf.js'));
    server = defaultConfig.servers['*default'];
  }

  assert(server.host, 'No server host.');
  assert(server.port, 'No server port.');

  const {O_RDWR, O_NOCTTY} = fs.constants;
  // let fd = fs.openSync('/dev/tty', O_RDWR + O_NOCTTY);

  // let fd = fs.openSync('/dev/ttys001','a');
  // console.log('fd => ', fd, 'is a tty => ', tty.isatty(fd));

  // try {
  //   fs.closeSync(fd);
  // }
  // catch (err) {
  //   console.error(err.stack || err);
  // }

  const fd = String(cp.execSync('tty', {stdio: ['inherit', 'pipe', 'pipe']})).trim();

  if (process.env.SUMAN_DEBUG === 'yes') {
    console.log('FD => ', fd);
  }

  const ret = {
    host: server.host,
    port: server.port,
    // fd_stdout: process.stdout._handle.fd,
    // fd_stderr: process.stderr._handle.fd,
    fd_stdout: fd,
    fd_stderr: fd,
    alreadyLive: null
  };

  tcpp.probe(server.host, server.port, function (err, available) {

    if (err) {
      console.log('tcpp probe error:', err.stack || err);
      return cb(err, ret);
    }

    ret.alreadyLive = !!available;

    if (available) {
      if (_suman.sumanOpts.verbose) {
        console.log('\n', ' => Suman server is already live.', '\n');
      }

      cb(null, ret);
    }
    else {

      const sumanCombinedOpts = JSON.stringify({
        sumanMatchesAny: _suman.sumanMatchesAny.map(i => i.toString().slice(1, -1)),
        sumanMatchesNone: _suman.sumanMatchesNone.map(i => i.toString().slice(1, -1)),
        sumanMatchesAll: _suman.sumanMatchesAll.map(i => i.toString().slice(1, -1)),
        sumanHelperDirRoot: _suman.sumanHelperDirRoot,
        verbosity: _suman.sumanOpts.verbosity,
      });

      let n, file;
      if (os.platform() === 'win32') {
        file = path.resolve(__dirname + '/../server/start-server.bat');
        n = cp.exec(file, [], {
          detached: false,
          env: Object.assign({}, process.env, {
            SUMAN_SERVER_OPTS: sumanCombinedOpts,
            NODE_ENV: $NODE_ENV || process.env.NODE_ENV,
            SUMAN_CONFIG: JSON.stringify(sumanConfig),
          })
        });
      }
      else {
        //TODO: configure 'open' command to use bash instead of Xcode

        // file = require.resolve(projectRoot + '/node_modules/suman-server');
        file = require.resolve('suman-server');

        const p = path.resolve(_suman.sumanHelperDirRoot + '/logs/server.log');

        fs.writeFileSync(p, '\n\n => Suman server started by user on ' + new Date(), {
          mode: 0o777,
          flag: 'w'
        });

        n = cp.spawn('node', [file], {
          execArgv: ['--trace-warnings'],
          env: Object.assign({}, process.env, {
            SUMAN_SERVER_OPTS: sumanCombinedOpts,
            NODE_ENV: $NODE_ENV || process.env.NODE_ENV,
            SUMAN_CONFIG: JSON.stringify(sumanConfig)
          }),
          detached: true,
          // stdio: [ 'ignore', 'ignore', 'ignore' ]
          silent: false, ////
          // stdio: [ 'ignore', fd, fd, 'ipc' ]
          // stdio: [ 'ignore', 1, 2, 'ipc' ]
          stdio: ['ignore', fs.openSync(p, 'a'), fs.openSync(p, 'a'), 'ipc']
        });

        // console.log(util.inspect(process.stdout));
        // console.log(util.inspect(process.stderr));

        n.on('error', function (err) {
          console.error(err.stack || err);
        });
      }

      setImmediate(function () {
        cb(null, ret);
      });
    }

  });

};
