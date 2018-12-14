import { Suman } from "../suman";
import { IItOpts, ITestDataObj } from "suman-types/dts/it";
import { TestBlock } from "./test-suite";
export declare const makeTheTrap: (suman: Suman, gracefulExit: Function) => (self: TestBlock, test: ITestDataObj, opts: Partial<IItOpts>, cb: Function) => any;
