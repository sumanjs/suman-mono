import { Suman } from "../suman";
import { ITestDataObj } from "suman-types/dts/it";
export declare const makeHandleTest: (suman: Suman, gracefulExit: Function) => (self: any, test: ITestDataObj, cb: Function, retryData?: any) => any;
