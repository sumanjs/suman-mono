//////////////////////////////////////

import * as chai from 'chai';

export interface IHookOrTestCaseParam {

  desc: string;
  callbackMode?: boolean
  slow: () => void;
  fatal: (err: any) => void;
  // callbackMode: boolean,
  timeout: Function;
  // skip: () => void;
  set: (k: string, v: any) => void;
  get: (k?: string) => any;
  getValues: (...args: Array<string>) => Array<any>;
  getMap: (...args: Array<string>) => object
  wrap: (fn: Function) => Function
  wrapFinal: (fn: Function) => Function;
  final: (fn: Function) => void;
  log: (...args: Array<any>) => void;
  wrapFinalErrorFirst: (fn: Function) => Function;
  wrapErrorFirst: (fn: Function) => Function;
  handleAssertions: (fn: Function) => void;
  assert: typeof chai.assert;
  expect: typeof chai.expect;
  should: typeof chai.should;
  skip: () => void;

}


export interface ITestCaseParam extends IHookOrTestCaseParam {
  // the t in t => {}
}


export interface IInjectHookParam extends IHookOrTestCaseParam {
  // the j in j => {}
}

export interface IAllHookParam extends IHookOrTestCaseParam {
  // the h in h => {}
}

export interface IEachHookParam extends IHookOrTestCaseParam {
  // the h in h => {}
}



