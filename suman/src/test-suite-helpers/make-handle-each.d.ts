import { IEachHookObj } from "suman-types/dts/test-suite";
import { Suman } from "../suman";
import { ITestDataObj } from "suman-types/dts/it";
export declare const makeHandleBeforeOrAfterEach: (suman: Suman, gracefulExit: Function) => (self: any, test: ITestDataObj, aBeforeOrAfterEach: IEachHookObj, cb: Function, retryData?: any) => any;
