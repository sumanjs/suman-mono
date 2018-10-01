'use strict';

//dts
import {IGlobalSumanObj, ISumanOpts} from 'suman-types/dts/global';
import EventEmitter = NodeJS.EventEmitter;
import {IRet, IExpectedCounts, IRetContainer, IResultsObj} from 'suman-types/dts/reporters';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import * as util from 'util';
import * as assert from 'assert';
import * as path from 'path';

//npm
const {events} = require('suman-events');

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
import {wrapReporter, getLogger} from "../../lib/utils";
const reporterName = path.basename(__dirname);
const log = getLogger(reporterName);

////////////////////////////////////////////////////////////////////////////////////

export const loadReporter = wrapReporter(reporterName, (retContainer: IRetContainer, results: IResultsObj,
                                                        s: EventEmitter, sumanOpts: ISumanOpts) => {


//TODO: allow printing of just one line of results, until a failure
//readline.clearLine(process.stdout, 0);
//process.stdout.write('\r' + chalk.green('Pass count: ' + successCount));


  return retContainer.ret = {
    results,
    reporterName
  } as IRet;

});

export default loadReporter;
