//////////////////////////////

import EventEmitter = NodeJS.EventEmitter;
import {ITestSuite} from "./test-suite";
import {ISumanConfig, ISumanOpts} from "./global";


export interface ISumanGlobalInternal {
  // defintion for global.__suman
}

export interface ITableDataCallbackObj {
  exitCode: number,
  tableData: Object
}



export interface ISumanServerInfo {
  host: string,
  port: number
}



