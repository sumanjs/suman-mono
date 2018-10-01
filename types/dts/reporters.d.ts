////////////////////////////////

import EventEmitter = NodeJS.EventEmitter;
import {ISumanOpts} from "./global";
import {ITestBlock} from "./test-suite";

export interface IResultsObj {
  n: number,
  passes: number,
  failures: number,
  skipped: number,
  stubbed: number
}

export interface IRet {
  results: IResultsObj,
  reporterName: string,
  count: number,
  cb: Function,
  completionHook?: Function
}

export interface IRetContainer {
  ret: IRet
}

export interface IExpectedCounts {
  TEST_CASE_FAIL: number,
  TEST_CASE_PASS: number,
  TEST_CASE_SKIPPED: number,
  TEST_CASE_STUBBED: number
}

export type IReporterLoadFnPre =
  (s: EventEmitter, sumanOpts: ISumanOpts, expectations?: IExpectedCounts, client?: SocketIOClient.Socket) => IRet;

export type IReporterLoadFn =
  (retContainer: IRetContainer, results: IResultsObj,
   s: EventEmitter, sumanOpts: ISumanOpts, expectations?: IExpectedCounts,
   client?: SocketIOClient.Socket) => IRet;


export interface ITAPJSONTestCase {
  testCase: ITestBlock,
  padding: number
  messageType: string
}
