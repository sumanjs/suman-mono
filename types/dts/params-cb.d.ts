///////////////////////

import * as chai from 'chai';
import {IHookOrTestCaseParam} from "./params";

export interface IHookOrTestCaseParamCallbackMode extends IHookOrTestCaseParam {
  done: (err?: any) => void;
}

export interface ITestCaseParam extends IHookOrTestCaseParamCallbackModee {
  // the t in t => {}
  (err?: any): void;
  pass: Function;
  fail: Function;
  wrap: IHookOrTestCaseParam['wrap'];
}

export interface IInjectHookParam extends IHookOrTestCaseParamCallbackModee {
  // the j in j => {}
  (err?: any): void;
  ctn: Function;
}

export interface IAllHookParam extends IHookOrTestCaseParamCallbackModee {
  // the h in h => {}
  (err?: any): void;
  ctn: Function;
}

export interface IEachHookParam extends IHookOrTestCaseParamCallbackModee {
  // the h in h => {}
  (err?: any): void;
  ctn: Function;
}



