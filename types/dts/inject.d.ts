/////////////////////////////////////

import {Subscription} from "rxjs";
import {IAllOpts, IHookObj} from "./test-suite";

export interface IInjectFn {
  (desc?: string, opts?: IInjectOpts, fn?: Function): void,
  cb?: IInjectFn,
  skip?: IInjectFn
}

export interface IInjectOpts extends IAllOpts {
  cb: boolean;
  plan: number,
  throws: RegExp
}


export interface IInjectionObj extends IHookObj {

}

export interface IInjectHook {

}

export type IInjectHookCallbackMode = (h: IInjectHook) => void;
export type IInjectHookRegularMode = (h: IInjectHook) => any;


export type TInjectHook =
  IInjectHookCallbackMode
