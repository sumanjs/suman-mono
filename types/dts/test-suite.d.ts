/////////////////////////////

// dts
import {Subscriber} from "rxjs/Subscriber";
import {Observable} from "rxjs/Observable";
import EventEmitter = NodeJS.EventEmitter;
import {ITestDataObj, ItFn} from "./it";
import {IBeforeEachFn, IBeforeEachObj} from "./before-each";
import {IAfterFn, IAfterObj} from "./after";
import {IAfterEachFn, IAFterEachObj} from "./after-each";
import {IBeforeFn} from "./before";
import {IDescribeFn} from "./describe";
import {IHookOrTestCaseParam} from "./params";

/////////////////////////////////////////////////////////////////////

export type TestSuiteMethodType = IBeforeEachFn | IBeforeFn | ItFn | IDescribeFn | IAfterFn | IAfterEachFn;

export interface IAcceptableOptions {
  [key: string]: true
}

export interface ITestBlock {
  getHooks(): TestSuiteMethods;
  set(k: any, v: any): boolean;
  get(k?: any): any;
  getValues(...args: Array<string>): Array<any>;
  getMap(...args: Array<string>): object;
  getInjectedValue(key: string): any;
  getInjectedValues(mandatory: string, ...args: string[]): Array<any>;
  getInjectedMap(...args: string[]): object;
  getSourced(): any;
  getSourcedValue(v: string): any;
  getSourcedValues(...args: string[]): Array<any>;
  getSourcedMap(...args: string[]): object;
}

export interface TestSuiteMethods {
  after: IAfterFn;
  afterEach: IAfterEachFn;
  before: IBeforeFn;
  beforeEach: IBeforeEachFn;
  describe: IDescribeFn,
  it: ItFn
}

export interface IAllOpts {
  __preParsed?: boolean,
  mode: string,
  parallel: boolean,
  series: boolean,
  serial: boolean,
  skip: boolean,
  only: boolean
}



export type IHandleError = (e: any) => void;
export type THookCallbackMode = (x: IHookOrTestCaseParam) => void;
export type HookRegularMode = (x: IHookOrTestCaseParam) => Promise<any>;
export type HookObservableMode = (x: IHookOrTestCaseParam) => Observable<any>;
export type HookSubscriberMode = (x: IHookOrTestCaseParam) => Subscriber<any>;
export type HookEEMode = (x: IHookOrTestCaseParam) => EventEmitter;


export type THook =
  THookCallbackMode |
  HookRegularMode |
  HookObservableMode |
  HookSubscriberMode |
  HookEEMode;



export interface ITestOrHookBaseEvents {
  success: string | Array<string>
  error: string | Array<string>
}


export interface ITestOrHookBase {
  timedOut?: boolean,
  alreadyInitiated?: boolean,
  desc: string,
  warningErr: Error,
  errorPlanCount?: string,
  planCountExpected?: number
  throws?: RegExp,
  didNotThrowErrorWithExpectedMessage?: string,
  ctx: any, // TestBlock but we can't import that here
  timeout: number,
  cb?: boolean,
  fn?: THook,
  type: string
  successEvents?: string | Array<string>,
  errorEvents?: string | Array<string>,
  events?: ITestOrHookBaseEvents;
  fatal: boolean,
  retries?: number
}

export interface IHookObj extends ITestOrHookBase {
  skipped?: boolean,
  dynamicallySkipped?: boolean
}

export interface IOnceHookObj extends IHookObj {

}

export interface IEachHookObj extends IHookObj {

}




