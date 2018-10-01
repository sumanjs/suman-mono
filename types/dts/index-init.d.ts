///////////////////////////

import EventEmitter = NodeJS.EventEmitter;

import {IDescribeFn, IDescribeOpts, TDescribeHook} from "./describe";
import {ISumanConfig, ISumanConfigOverridable, ISumanOpts, ISumanOptsOverridable} from "./global";
import {DefineObjectContext} from 'suman/dist/test-suite-helpers/define-options-classes';
import {ITestBlock} from "./test-suite";

export interface IIntegrantsMessage {
  data: string,
  info: string,
  val: string
}

export interface ICreateOpts {
  delay: boolean,
  skip: boolean,
  only: boolean
}

// we don't know any of the args because of dependency injection
export type TCreateHook = (b: ITestBlock, ...args: any[]) => void;

export interface ISumanModuleExtended extends NodeModule {
  sumanInitted?: boolean
}

export interface IOverride {
  opts?: Partial<ISumanOptsOverridable>;
  config?: Partial<ISumanConfigOverridable>;
}

export interface IInitOpts {
  [key: string]: any,
  __expectedExitCode?: number;
  pre?: Array<string>;
  integrants?: Array<string>;
  series?: boolean;
  timeout?: number;
  post?: Array<any>;
  iocData?: IIoCData;
  ioc?: Object;
  override?: IOverride;
}

export interface IIoCData {
  $pre?: Object;
  [key: string]: any;
}

export type TDefineCallback = (o: DefineObjectContext) => DefineObjectContext | void;
export type TDefine = (desc?: string | TDefineCallback, f?: TDefineCallback) => DefineObjectContext;

export interface IInitRet {
  Test: IInitRet,
  create: IStartCreate
  file: string,
  parent: string,
  define: TDefine
}

export type TArray = Array<string | Partial<IDescribeOpts> | TCreateHook>;

// export interface IStartCreate {
//   (desc: string | Partial<IDescribeOpts> | TCreateHook | TArray,
//    opts?: Partial<IDescribeOpts> | TCreateHook | TArray,
//    arr?: TArray | TCreateHook): void;
//   tooLate?: boolean;
// }

export interface IStartCreate {
  (desc: string, opts: Partial<IDescribeOpts>, h: TCreateHook): void;
  (desc: string, h: TCreateHook): void;
  (h: TCreateHook): void;
  tooLate?: boolean;
}

export interface IInitFn {
  (module: ISumanModuleExtended,
   opts?: IInitOpts,
   sumanOptsOverride?: Partial<ISumanOptsOverridable>,
   sumanConfigOverride?: Partial<ISumanConfigOverridable>): IInitRet;
}
