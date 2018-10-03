import { ISumanConfig, ISumanOpts } from "suman-types/dts/global";
import { IAllOpts } from "suman-types/dts/test-suite";
import { Suman } from "../suman";
import { ISumanServerInfo } from "suman-types/dts/suman";
import { IRet } from "suman-types/dts/reporters";
import { EVCb } from "suman-types/dts/general";
import { TestBlock } from "../test-suite-helpers/test-suite";
export declare const handleSetupComplete: (zuite: TestBlock, type: string) => void;
export declare const makeRequireFile: (projectRoot: string) => (v: string) => void;
export declare const extractVals: (val: any) => {
    timeout: number;
    subDeps: string[];
    fn: Function;
    props: string[];
};
export declare const makeHandleAsyncReporters: (reporterRets: IRet[]) => (cb: Function) => any;
export declare const makeRunGenerator: (fn: Function, ctx: any) => () => Promise<any>;
export declare const asyncHelper: (key: string, resolve: Function, reject: Function, $args: any[], ln: number, fn: Function) => any;
export declare const implementationError: (err: any, isThrow?: boolean) => void;
export declare const loadSumanConfig: (configPath: string, opts: Object) => any;
export declare const resolveSharedDirs: (sumanConfig: ISumanConfig, projectRoot: string, sumanOpts: ISumanOpts) => any;
export declare const loadSharedObjects: (pathObj: Object, projectRoot: string, sumanOpts: ISumanOpts) => any;
export declare const vetPaths: (paths: string[]) => void;
export declare const fatalRequestReply: (obj: any, $cb: EVCb<any, any>) => any;
export declare const findSumanServer: (serverName?: string) => ISumanServerInfo;
export declare const makeOnSumanCompleted: (suman: Suman) => (code: number, msg: string) => void;
export interface ClonedError {
    isTimeout?: boolean;
    stack: string;
    message: string;
}
export interface SumanPseudoError {
    stack?: string;
    message?: string;
    sumanFatal?: boolean;
    sumanExitCode?: number;
    isFromTest?: boolean;
}
export declare const cloneError: (err: Error, newMessage: string, strip?: boolean) => ClonedError;
export declare const parseArgs: (args: any[], fnIsRequired?: boolean) => {
    arrayDeps: IAllOpts[];
    args: any[];
};
export declare const evalOptions: (arrayDeps: IAllOpts[], opts: IAllOpts) => string[];
