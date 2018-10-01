/////////////////////

import {IEachHookObj} from "./test-suite";
import {IEachHookParam} from './params';
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import EventEmitter = NodeJS.EventEmitter;
import {DefineObjectEachHook} from 'suman/dist/test-suite-helpers/define-options-classes';

type SubsetOfBeforeOpts = Partial<IBeforeEachOpts>;
type IBeforeFnArgTypes = SubsetOfBeforeOpts | TBeforeEachHook | Array<string | SubsetOfBeforeOpts | TBeforeEachHook>;

export type TDefineCallback = (o: DefineObjectEachHook) => void;
export type TDefine = (desc?: string | TDefineCallback, f?: TDefineCallback) => DefineObjectEachHook;


export interface IBeforeEachFn {
    // (desc?: string, opts?: IBeforeOpts, fn?: TBeforeEachHook): void,
    (name: string, ...args: IBeforeFnArgTypes[]): void;
    cb?: IBeforeEachFn;
    skip?: IBeforeEachFn;
    define?: TDefine
}

export interface IBeforeEachObj extends IEachHookObj {

}

export interface IBeforeEachOpts {
    __preParsed?: boolean,
    skip: boolean,
    timeout: number,
    fatal: boolean,
    cb: boolean,
    throws: RegExp,
    plan: number
}


export type BeforeEachHookCallbackMode = (h: IEachHookParam) => void;
export type BeforeEachHookRegularMode = (h: IEachHookParam) => Promise<any>;
export type BeforeEachHookObservableMode = (h: IEachHookParam) => Observable<any>;
export type BeforeEachHookSubscriberMode = (h: IEachHookParam) => Subscriber<any>;
export type BeforeEachHookEEMode = (h: IEachHookParam) => EventEmitter;


export type TBeforeEachHook =
  BeforeEachHookCallbackMode |
  BeforeEachHookRegularMode |
  BeforeEachHookObservableMode |
  BeforeEachHookSubscriberMode |
  BeforeEachHookEEMode

