'use strict';

//core
import fs = require('fs');
import path = require('path');
import net = require('net');
import util = require('util');
import assert = require('assert');
import chalk from 'chalk';

//npm
import residence = require('residence');
import {Pool} from 'poolio';
import {JSONParser} from '@oresoftware/json-stream-parser';

/////////////////////////////////////////////////////////////////////


const isDebug = process.env.suman_daemon_debug === 'yes';

const log = {
  info: console.error.bind(console, chalk.cyan(`suman-daemon info:`)),
  warn: console.error.bind(console, chalk.yellow.bold('suman-daemon warning:')),
  error: console.error.bind(console, chalk.redBright('suman-daemon error:')),
  debug: function () {
    isDebug && console.error.call(console, chalk.magenta('suman-deamon debug:'), ...arguments);
  }
};

///////////////////////////////////////////////

const port = 9091;
log.info('starting suman-daemon, will attempt to listen on port:', chalk.bold(String(port)));
log.info('suman lib root => ', process.env.SUMAN_LIBRARY_ROOT_PATH);

if (!process.stdout.isTTY) {
  log.error('process is not a tty, cannot run suman-daemon.');
  // process.exit(1);
}

const f = path.resolve(process.env.HOME + '/.suman/daemon.pid');

try {
  fs.writeFileSync(f, String(process.pid));
}
catch (err) {
  log.error('\n', err.stack, '\n');
  process.exit(1);
}

log.info('suman daemon loaded...');

const p = new Pool({
  filePath: path.resolve(__dirname + '/suman-fast-script.js'),
  size: 3,
  env: Object.assign({}, process.env, {
    FORCE_COLOR: 1
  }),
  // env: Object.assign({}, process.env, {
  //   SUMAN_LIBRARY_ROOT_PATH: sumanLibRoot,
  //   SUMAN_PROJECT_ROOT: projectRoot
  // }),
  streamStdioAfterDelegation: true,
  oneTimeOnly: true,
  inheritStdio: true,
  resolveWhenWorkerExits: true
});

p.on('error', (e: any) => {
  log.error('pool error:', e.stack || e);
});

const server = net.createServer(s => {

  log.info('socket connection made.');

  s.pipe(new JSONParser())
    .once('error', function (e: Error) {
      log.error(e.stack || e);
      s.end(e.stack || e);
      s.destroy();
    })
    .on('data', function (obj: any) {

      log.info('message from ', util.inspect(obj));

      try {
        assert(typeof obj.pid === 'number', 'object has no process id.');
        assert(Array.isArray(obj.args), 'object has no arguments array.');
      }
      catch (err) {
        log.error(err.message);
        return;
      }

      // socket.write('pinnochio');
      return p.any(obj, {socket: s});
    });

});


server.once('listening', function () {
  log.info(`suman daemon tcp server listening on port ${port}`);
});

server.listen(port);








