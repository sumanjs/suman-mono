//////

import {IEachHookObj} from "./test-suite";
import {IEachHookParam} from './params';
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import EventEmitter = NodeJS.EventEmitter;
import {DefineObjectEachHook} from 'suman/dist/test-suite-helpers/define-options-classes';

type SubsetOfAfterEachOpts = Partial<IAfterEachOpts>;
type IAfterEachFnArgTypes = SubsetOfAfterEachOpts | TAfterEachHook 
  | Array<string | SubsetOfAfterEachOpts | TAfterEachHook>;


export type TDefineCallback = (o: DefineObjectEachHook) => void;
export type TDefine = (desc?: string | TDefineCallback, f?: TDefineCallback) => DefineObjectEachHook;

export interface IAfterEachFn {
  // (desc?: string; opts?: IAfterOpts; fn?: TAfterEachHook): void;
  (name: string, ...args: IAfterEachFnArgTypes[]): void;

  cb?: IAfterEachFn;
  skip?: IAfterEachFn;
  define?: TDefine
}

export interface IAfterEachOpts {
  __preParsed?: boolean,
  skip: boolean,
  timeout: number,
  fatal: boolean,
  cb: boolean,
  throws: RegExp,
  plan: number
}

export interface IAFterEachObj extends IEachHookObj {
  desc: string,
  throws: RegExp,
  type: string,
  warningErr: Error
}

type AfterEachHookCallbackMode = (h: IEachHookParam) => void;
type AfterEachHookRegularMode = (h: IEachHookParam) => Promise<any>;
type AfterEachHookObservableMode = (h: IEachHookParam) => Observable<any>;
type AfterEachHookSubscriberMode = (h: IEachHookParam) => Subscriber<any>;
type AfterEachHookEEMode = (h: IEachHookParam) => EventEmitter;

export type TAfterEachHook =
  AfterEachHookCallbackMode |
  AfterEachHookRegularMode |
  AfterEachHookObservableMode |
  AfterEachHookSubscriberMode |
  AfterEachHookEEMode

