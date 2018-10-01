'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import EventEmitter = NodeJS.EventEmitter;
import {IRet, IExpectedCounts, IRetContainer, IResultsObj} from 'suman-types/dts/reporters';
import {ITestDataObj} from "suman-types/dts/it";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import util = require('util');
import path = require('path');

//npm
const sqlite3 = require('sqlite3').verbose();
import su = require('suman-utils');

//project
import {events} from 'suman-events';
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);

////////////////////////////////////////////////

const p = path.resolve(process.env.HOME + '/.suman/global/node_modules/sqlite3');
const dbPth = path.resolve(process.env.HOME + '/.suman/db');
// let sqlite3 = require(p).verbose();

let db = new sqlite3.Database(dbPth, function (err: Error) {
  if (err) {
    log.error(err);
  }
  else {
    log.veryGood(' => SQLite connected.');
  }
});

db.on('error', function (err: Error) {
  log.error(' => sqlite error => ', err);
});

db.configure('busyTimeout', 4000);

/////////////////////////////////////////////////////////////

const noop = function () {
  // we use this noop fn in several places
};



/////////////////////////////////////////////////////////////

export const loadReporter = wrapReporter(reporterName, (retContainer: IRetContainer, results: IResultsObj, s: EventEmitter,
                                                        sumanOpts: ISumanOpts, expectations: IExpectedCounts) => {

  const runAsync = function (fn: Function) {
    retContainer.ret.count++;
    fn(function (err: Error) {
      err && log.error(err.stack || err);
      retContainer.ret.count--;
      if (retContainer.ret.count < 1) {
        // ret.cb starts off as a noop, but the suman framework
        // will reassign the value in the future and it will signal that we are done
        retContainer.ret.cb();
      }
    });
  };

  const runPromise = function (promise: Promise<any>) {
    retContainer.ret.count++;
    return promise
    .catch(err => err && log.error(err.stack || err))
    .then(function () {
      retContainer.ret.count--;
      retContainer.ret.count < 1 && retContainer.ret.cb();
    });
  };

  s.on(String(events.FATAL_TEST_ERROR), function (val: any) {

    runAsync(function (cb: Function) {
      db.serialize(function () {
        db.run('CREATE TABLE lorem (info TEXT)');
        let stmt = db.prepare('INSERT INTO lorem VALUES (?)');
        for (let i = 0; i < 10; i++) {
          stmt.run('Ipsum ' + i);
        }
        stmt.finalize();
        db.all('SELECT rowid AS id, info FROM lorem', function (err: Error, rows: Array<any>) {
          log.info('rows count => ', rows.length);
          cb()
        });
      });
    });
  });

  s.on(String(events.TEST_CASE_END), function (val: any) {
    runAsync(function (cb: Function) {
      db.serialize(function () {
        db.run('CREATE TABLE lorem (info TEXT)');
        let stmt = db.prepare('INSERT INTO lorem VALUES (?)');
        for (let i = 0; i < 1; i++) {
          stmt.run('Ipsum ' + i);
        }
        stmt.finalize();
        db.all('SELECT rowid AS id, info FROM lorem', function (err: Error, rows: Array<any>) {
          log.info('rows count => ', rows.length);
          cb()
        });
      });
    });
  });

  s.on(String(events.TEST_CASE_PASS), function (val: any) {
    runAsync(function (cb: Function) {
      db.serialize(function () {
        db.run('CREATE TABLE lorem (info TEXT)');
        let stmt = db.prepare('INSERT INTO lorem VALUES (?)');
        for (let i = 0; i < 1; i++) {
          stmt.run('Ipsum ' + i);
        }
        stmt.finalize();
        db.all('SELECT rowid AS id, info FROM lorem', function (err: Error, rows: Array<any>) {
          log.info('rows count => ', rows.length);
          cb()
        });
      });

    });
  });

  s.on(String(events.TEST_CASE_SKIPPED), function (val: any) {
    runAsync(function (cb: Function) {
      db.serialize(function () {
        db.run('CREATE TABLE lorem (info TEXT)');
        let stmt = db.prepare('INSERT INTO lorem VALUES (?)');
        for (let i = 0; i < 1; i++) {
          stmt.run('Ipsum ' + i);
        }
        stmt.finalize();
        db.all('SELECT rowid AS id, info FROM lorem', function (err: Error, rows: Array<any>) {
          log.info('rows count => ', rows.length);
          cb()
        });
      });
    });
  });

  s.on(String(events.TEST_CASE_STUBBED), function (val: any) {
    runAsync(function (cb: Function) {
      db.serialize(function () {
        db.run('CREATE TABLE lorem (info TEXT)');
        let stmt = db.prepare('INSERT INTO lorem VALUES (?)');
        for (let i = 0; i < 1; i++) {
          stmt.run('Ipsum ' + i);
        }
        stmt.finalize();
        db.all('SELECT rowid AS id, info FROM lorem', function (err: Error, rows: Array<any>) {
          log.info('rows count => ', rows.length);
          cb()
        });
      });
    });
  });

  return retContainer.ret = <IRet> {
    results,
    reporterName,
    count: 0,
    cb: noop
  };

});

export default loadReporter;
