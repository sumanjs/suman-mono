import { ISumanConfig, ISumanOpts } from "suman-types/dts/global";
import { ISumanServerInfo } from "suman-types/dts/suman";
import { IInitOpts } from "suman-types/dts/index-init";
import { ITestDataObj } from "suman-types/dts/it";
import { TestBlock } from "./test-suite-helpers/test-suite";
export interface ITestBlockMethodCache {
    [key: string]: Object;
}
export interface ISumanInputs {
    fileName: string;
    timestamp: number;
    usingLiveSumanServer: boolean;
    server: ISumanServerInfo;
    opts: ISumanOpts;
    config: ISumanConfig;
    force: boolean;
}
export declare class Suman {
    ctx?: TestBlock;
    supply: Object;
    private __supply;
    testBlockMethodCache: Map<Function, ITestBlockMethodCache>;
    iocData: Object;
    force: boolean;
    interface: string;
    fileName: string;
    opts: ISumanOpts;
    config: ISumanConfig;
    slicedFileName: string;
    containerProxy: any;
    timestamp: number;
    sumanId: number;
    allDescribeBlocks: Array<TestBlock>;
    describeOnlyIsTriggered: boolean;
    deps: Array<string>;
    usingLiveSumanServer: boolean;
    numHooksSkipped: number;
    numHooksStubbed: number;
    numBlocksSkipped: number;
    rootSuiteDescription: string;
    dateSuiteFinished: number;
    dateSuiteStarted: number;
    filename: string;
    itOnlyIsTriggered: boolean;
    extraArgs: Array<string>;
    sumanCompleted: boolean;
    desc: string;
    getQueue: Function;
    iocPromiseContainer: object;
    constructor(obj: Partial<ISumanOpts>);
    getTableData(): void;
    logFinished($exitCode: number, skippedString: string, cb: Function): void;
    logResult(test: ITestDataObj): void;
}
export declare type ISuman = Suman;
export declare const makeSuman: ($module: NodeModule, opts: IInitOpts, sumanOpts: Partial<ISumanOpts>, sumanConfig: Partial<ISumanConfig>) => Suman;
