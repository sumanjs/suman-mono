//////////////////////

import {IAllOpts, ITestBlock} from "./test-suite";

type IDescribeFnArgTypes = Partial<IDescribeOpts> | TDescribeHook | Array<string | TDescribeHook>;

export interface IDescribeFn {
  // (s: string, ...args: IDescribeFnArgTypes[]): void,

  (s: string, h: TDescribeHook): void,
  (s: string, o: IDescribeOpts, h: TDescribeHook): void,

  delay?: IDescribeFn,
  skip?: IDescribeFn,
  only?: IDescribeFn,
  parallel?: IDescribeFn,
  series?: IDescribeFn

}

export interface IDescribeOpts extends IAllOpts {

}

export type TDescribeHook = (b: ITestBlock, ...args: any[]) => void;
