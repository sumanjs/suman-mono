/// <reference types="node" />
import { VamootProxy } from "vamoot";
import { IHookOrTestCaseParam } from "suman-types/dts/params";
import { ITimerObj } from "suman-types/dts/general";
import EE = require('events');
import * as chai from 'chai';
export declare abstract class ParamBase extends EE implements IHookOrTestCaseParam {
    protected __timerObj: ITimerObj;
    protected __handle: Function;
    __shared: VamootProxy;
    protected __fini: Function;
    callbackMode?: boolean;
    assert: typeof chai.assert;
    should: typeof chai.should;
    expect: typeof chai.expect;
    protected __tooLate: boolean;
    desc: string;
    state: 'pending' | 'errored' | 'completed';
    constructor();
    abstract onTimeout(): void;
    timeout(val: number): any;
    done(err?: Error): void;
    fatal(err: any): void;
    set(k: string, v: any): boolean;
    get(k?: string): any;
    getValues(...args: Array<string>): any[];
    getMap(...args: Array<string>): any;
    wrap(fn: Function): () => any;
    wrapFinal(fn: Function): () => any;
    final(fn: Function, ctx?: any): any;
    finally(fn: Function, ctx?: any): any;
    log(...args: Array<any>): void;
    slow(): void;
    wrapFinalErrorFirst(fn: Function): (err: Error) => any;
    wrapErrorFirst(fn: Function): (err: any) => any;
    handleAssertions(fn: Function, ctx?: any): any;
    handlePossibleError(err: any): void;
    handleNonCallbackMode(err: any): void;
    throw(str: any): void;
}
export interface ParamBase {
    pass: typeof ParamBase.prototype.done;
    ctn: typeof ParamBase.prototype.done;
    fail: typeof ParamBase.prototype.done;
    finalErrFirst: typeof ParamBase.prototype.final;
    finalErrorFirst: typeof ParamBase.prototype.final;
    wrapFinalErrFirst: typeof ParamBase.prototype.wrapFinalErrorFirst;
    wrapFinalErr: typeof ParamBase.prototype.wrapFinalErrorFirst;
    wrapFinalError: typeof ParamBase.prototype.wrapFinalErrorFirst;
    wrapErrFirst: typeof ParamBase.prototype.wrapErrorFirst;
}
