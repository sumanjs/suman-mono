'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import EventEmitter = NodeJS.EventEmitter;
import {IRet, IRetContainer, IExpectedCounts, IResultsObj} from 'suman-types/dts/reporters';
import {ITestDataObj} from "suman-types/dts/it";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';

//npm
const ProgressBar = require('progress');
const {events} = require('suman-events');
import su = require('suman-utils');

//project
import {getLogger, wrapReporter} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);

///////////////////////////////////////////////////////////////////////////////////////////////////

const onAnyEvent = function (data: string) {
  process.stdout.write(String(data));
};

////////////////////////////////////////////////////////////////////////////////////////////////////

export const loadreporter = wrapReporter(reporterName,
  (retContainer: IRetContainer, results: IResultsObj, s: EventEmitter, sumanOpts: ISumanOpts, expectations: IExpectedCounts) => {
    
    let progressBar: any;
    
    s.on(events.RUNNER_STARTED, function onRunnerStart(totalNumTests) {
      log.info('runner has started.');
      progressBar = new ProgressBar(' => progress [:bar] :percent :current :token1 :token2', {
        total: totalNumTests,
        width: 120
      });
    });
    
    s.on(String(events.TEST_FILE_CHILD_PROCESS_EXITED), function onTestEnd(d) {
      
      if (!progressBar) {
        log.error('progress bar was not yet initialized.');
        return;
      }
      
      // process.stdout.write('\n\n');
      // process.stdout.write(' Test finished with exit code = ' + d.exitCode + ' => path => ' + d.testPath);
      // process.stdout.write('\n\n');
      progressBar.tick({
        'token1': "",
        'token2': ""
      });
    });
    
    s.on(String(events.RUNNER_EXIT_CODE), onAnyEvent);
    
    s.on(events.RUNNER_ENDED, function onRunnerEnd() {
      log.good('Runner has ended.');
    });
    
    return retContainer.ret = <IRet>{
      reporterName
    };
    
  });

export default loadreporter;
