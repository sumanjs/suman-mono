/////////////

import {IOnceHookObj} from "./test-suite";
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import EventEmitter = NodeJS.EventEmitter;
import {DefineObjectAllHook} from 'suman/dist/test-suite-helpers/define-options-classes';
import {IAllHookParam} from "./params";

type SubsetOfAfterOpts = Partial<IAfterOpts>;
type IAfterFnArgTypes = SubsetOfAfterOpts | TAfterHook | Array<string | SubsetOfAfterOpts | TAfterHook>;


export type TDefineCallback = (o: DefineObjectAllHook) => void;
export type TDefine = (desc?: string | TDefineCallback, f?: TDefineCallback) => DefineObjectAllHook;

export interface IAfterFn {
  // (desc?: string; opts?: IAfterOpts; fn?: TAfterHook): void;
  (name: string, ...args: IAfterFnArgTypes[]): void;
  cb?: IAfterFn,
  skip?: IAfterFn,
  always?: IAfterFn,
  last?: IAfterFn,
  define?: TDefine
}

export interface IAfterObj extends IOnceHookObj {
  last: boolean;
  always: boolean;
  first: boolean;
}

export interface IAfterOpts {
  __preParsed?: boolean;
  skip: boolean;
  timeout: number;
  fatal: boolean;
  cb: boolean;
  throws: RegExp;
  plan: number;
  last: boolean;
  always: boolean;
}

export type AfterHookCallbackMode = (h: IAllHookParam) => void;
export type AfterHookRegularMode = (h: IAllHookParam) => Promise<any>;
export type AfterHookObservableMode = (h: IAllHookParam) => Observable<any>;
export type AfterHookSubscriberMode = (h: IAllHookParam) => Subscriber<any>;
export type AfterHookEEMode = (h: IAllHookParam) => EventEmitter;

export type TAfterHook =
  AfterHookCallbackMode |
  AfterHookRegularMode |
  AfterHookObservableMode |
  AfterHookSubscriberMode |
  AfterHookEEMode
