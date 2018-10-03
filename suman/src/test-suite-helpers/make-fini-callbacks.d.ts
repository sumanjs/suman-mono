import { IHookObj } from "suman-types/dts/test-suite";
import { ISumanDomain } from "suman-types/dts/global";
import { ITestDataObj } from "suman-types/dts/it";
import { IAssertObj, ITimerObj } from "suman-types/dts/general";
export declare const makeAllHookCallback: (d: ISumanDomain, assertCount: IAssertObj, hook: IHookObj, timerObj: ITimerObj, gracefulExit: Function, cb: Function) => (err: any, isTimeout?: boolean) => any;
export declare const makeEachHookCallback: (d: ISumanDomain, assertCount: IAssertObj, hook: IHookObj, timerObj: ITimerObj, gracefulExit: Function, cb: Function) => (err: any, isTimeout?: boolean) => void;
export declare const makeTestCaseCallback: (d: ISumanDomain, assertCount: IAssertObj, test: ITestDataObj, timerObj: ITimerObj, gracefulExit: Function, cb: Function) => (err: any, isTimeout?: boolean) => any;
