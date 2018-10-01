////////////////////////

import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import EventEmitter = NodeJS.EventEmitter;
import {IAllOpts, IOnceHookObj} from "./test-suite";
import {DefineObjectAllHook} from 'suman/dist/test-suite-helpers/define-options-classes';
import {IAllHookParam} from "./params";

export interface IBeforeObj extends IOnceHookObj {
  last: boolean;
  always: boolean;
  first: boolean;
}

type SubsetOfBeforeOpts = Partial<IBeforeOpts>;
type IBeforeFnArgTypes = SubsetOfBeforeOpts | TBeforeHook | Array<string | SubsetOfBeforeOpts | TBeforeHook>;

export type TDefineCallback = (o: DefineObjectAllHook) => void;
export type TDefine = (desc?: string | TDefineCallback, f?: TDefineCallback) => DefineObjectAllHook;

export interface IBeforeFn {
  // (desc?: string, opts?: IBeforeOpts, fn?: TBeforeHook): void,
  (name: string, ...args: IBeforeFnArgTypes[]): void;
  cb?: IBeforeFn;
  skip?: IBeforeFn;
  define?: TDefine
}

export interface IBeforeOpts extends IAllOpts {
  timeout: number;
  fatal: boolean;
  cb: boolean;
  throws: RegExp;
  plan: number;
}

export type BeforeHookCallbackMode = (h: IAllHookParam) => void;
export type BeforeHookRegularMode = (h?: IAllHookParam) => Promise<any>;
export type BeforeHookObservableMode = (h?: IAllHookParam) => Observable<any>;
export type BeforeHookSubscriberMode = (h?: IAllHookParam) => Subscriber<any>;
export type BeforeHookEEMode = (h?: IAllHookParam) => EventEmitter;

export type TBeforeHook =
  BeforeHookCallbackMode |
  BeforeHookRegularMode |
  BeforeHookObservableMode |
  BeforeHookSubscriberMode |
  BeforeHookEEMode



