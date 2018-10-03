import { IReporterLoadFn, IReporterLoadFnPre } from "suman-types/dts/reporters";
export interface FooBar {
    dummy: string;
}
export declare const getLogger: (reporterName: string) => any;
export declare const wrapReporter: (reporterName: string, fn: IReporterLoadFn) => IReporterLoadFnPre;
