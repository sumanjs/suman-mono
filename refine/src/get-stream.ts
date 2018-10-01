'use strict';

//core
import util = require('util');
import assert = require('assert');

//npm
import parser from 'tap-json-parser';
import {events} from 'suman-events';
import JSONStdio = require('json-stdio');
import chalk from 'chalk';
import _ = require('lodash');
import log from './logger';

//project
import {tb} from "./utils";

//////////////////////////////////////////////////////////////////////////////////////

export const getTestPointStream = function () {
  
  let p;
  
  p = parser();
  
  p.on('testpoint', function (testpoint: Object) {
    
    testpoint = testpoint.testCase || testpoint;
    
    debugger;
    
    tb.emit(String(events.TEST_CASE_END), testpoint);
    
    if (testpoint.skip) {
      tb.emit(String(events.TEST_CASE_SKIPPED), testpoint);
    }
    else if (testpoint.todo) {
      tb.emit(String(events.TEST_CASE_STUBBED), testpoint);
    }
    else if (testpoint.ok) {
      tb.emit(String(events.TEST_CASE_PASS), testpoint);
    }
    else {
      tb.emit(String(events.TEST_CASE_FAIL), testpoint);
    }
  });
  
  return p;
  
};

const kindMap = <any> {
  warning: 'yellow',
  error: 'red',
  info: 'cyan',
  goodnews: 'green',
  good: 'green',
  verygood: 'green'
};

let logMessages = function (kind: string, messages: Array<string>) {
  let kindMapSearch = String(kind).trim().toLowerCase();
  let method = kindMap[kindMapSearch] || 'red';
  let fn = (chalk[method] || chalk.red).bold;
  _.flattenDeep([messages]).forEach(function (m: string) {
    log.info(fn(m));
  });
};

export const getJSONStdioStream = function () {
  
  let p = JSONStdio.createParser();
  // let p = JSONStdio.createParser(su.constants.JSON_STDIO_SUMAN_R);
  
  let stdEventName = JSONStdio.stdEventName;
  assert(typeof stdEventName === 'string',
    `Suman implementation error: 'json-stdio' library does not export an expected property.`);
  
  p.on(stdEventName, function (obj: any) {
    
    debugger;
    
    if (!obj) {
      log.warning(`Suman implementation warning: no json-stdio object passed to '${stdEventName}' handler.`);
      return;
    }
    
    if (obj.sumanMessage === true) {
      logMessages(obj.kind, obj.messages || obj.message);
      return;
    }
    
    const msgType = String(obj.messageType);
    
    if (msgType in events) {
      tb.emit(msgType, obj);
    }
    else {
      log.warning(' => json stdio object "messageType" property was not a key in suman-events.');
      log.warning(' => json stido object value:', util.inspect(obj));
    }
    
  });
  
  return p;
  
};
