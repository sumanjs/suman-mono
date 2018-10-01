//////////////////////////////////

import Global = NodeJS.Global;
import Domain = NodeJS.Domain;
import {ITestSuite} from "./test-suite";
import EventEmitter = NodeJS.EventEmitter;
import { ITableDataCallbackObj} from "./suman";
import {IMapValue} from "./suman-utils";
import {IRet} from './reporters';
import {AsyncQueue} from 'async';

export interface IntegrantHashKeyVals {
  [key: string]: any
}

export interface ICurrentPaddingCount {
  val: number
}

export interface ISumanLogger {
   info: Function,
   error: Function,
   warning: Function,
   good: Function,
   verygood: Function
}

export interface IGlobalSumanObj {
  // we should execute Suman's in series, that makes it easier to run after.always shutdown, etc
  // which suman represents which Suman is executing at a given time

  afterAlwaysHasBeenRegistered?: boolean;
  testErrors?: Array<any>;
  isActualExitHandlerRegistered?: boolean,
  tsrq: AsyncQueue<Function>,
  $staticIoc: Object,
  reporterRets: Array<IRet>,
  activeDomain: Domain,
  currentPaddingCount: ICurrentPaddingCount,
  endLogStream: Function,
  tableResults: Array<ITableDataCallbackObj>,
  startDateMillis: number,
  socketServerPort: number,
  $forceInheritStdio: boolean,
  markersMap: IMapValue,
  integrantHashKeyVals: IntegrantHashKeyVals,
  usingDefaultConfig: boolean,
  istanbulExecPath: string,
  multiWatchReady: boolean,
  sumanSingleProcessStartTime: number,
  processIsRunner?: boolean;
  dateEverythingStarted: number;
  runId: number,
  isStrmDrained: boolean,
  drainCallback: Function,
  inceptionLevel?: number,
  whichSuman: any,
  log: ISumanLogger,
  $pre: Object,
  afterAlwaysEngaged: boolean,
  timestamp: Number,
  inBrowser: boolean,
  ctx: ITestSuite,
  viaSuman: boolean,
  sumanHelperDirRoot: string,
  writeTestError: Function,
  sumanRuntimeErrors: Array<Error | string>,
  sumanOpts: ISumanOpts,
  suiteResultEmitter: EventEmitter,
  maxMem: IMaxMem,
  sumanConfig: ISumanConfig,
  describeOnlyIsTriggered: boolean,
  sumanTestFile: string,
  userData: Object,
  iocConfiguration: Object,
  weAreDebugging: boolean,
  checkTestErrorLog: boolean,
  writeLog: Function,
  expectedExitCode: number,
  oncePreKeys: Array<string>,
  oncePostKeys: Array<string>,
  integProgressEmitter: EventEmitter,
  integContainer: Object,
  integProgressContainer: Object,
  iocEmitter: EventEmitter,
  iocContainer: Object,
  iocProgressContainer: Object,
  resultBroadcaster: EventEmitter,
  sumanReporters: Array<Object>,
  integrantsEmitter: EventEmitter,
  uncaughtExceptionTriggered: Object,
  projectRoot: string,
  usingRunner: boolean,
  sumanInitCalled: boolean,
  sumanInitStartDate: number,
  SUMAN_TEST: string,
  sumanInitTime: number,
  expectedTimeout: number
}

export interface IMaxMem {
  heapTotal: number,
  heapUsed: number
}

export interface ISumanOptsOverridable {
  [key: string]: any,
  allowSkip: boolean,
  allowOnly: boolean,
  bail: boolean,
  series: boolean,
  parallel: boolean,
  parallelMax: boolean,
  verbosity: number,
  useTAPOutput: boolean,
  useTAPJSONOutput: boolean
}

export interface ISumanOpts {
  [key: string]: any,

  transpile: boolean,
  bail: boolean,
  series: boolean,
  parallel: boolean,
  allow_skip: boolean,
  allow_only: boolean,
  
  debugHooks: boolean,
  debug_hooks: boolean,
  parallel_max: boolean,

  ///// above this line may need fixin'

  log_stdio_to_files: boolean,
  log_stdout_to_files: boolean,
  
  
  log_stderr_to_files: boolean,
  cwd_is_root: boolean,
  full_stack_traces: boolean,
  runner: boolean,
  coverage: boolean,
  watch_per: string,
  watch: boolean,
  no_transpile: boolean,
  no_run: boolean,
  no_color: boolean,
  register: boolean,
  rand: boolean,
  no_tables: boolean,
  force: boolean,
  fforce: boolean,
  reporters: string,
  reporter_paths: Array<string>
  strict: boolean,
  suman_helpers_dir: boolean,
  init: boolean,
  ignoreUncaughtExceptions: boolean,
  use_tap_output: boolean,
  use_tap_json_output: boolean
  $useTAPOutput: boolean,
  $useTAPJSONOutput: boolean,
  verbosity: number,
  check_memory_usage: boolean
  errors_only: boolean
}

export interface ISumanGlobalInternal {
  viaSuman?: boolean

}

export interface ISumanGlobal extends Global {
  __suman?: IGlobalSumanObj
}

export interface SumanErrorRace extends Error {
  _alreadyHandledBySuman?: boolean
}



export interface IPromiseWithDomain extends Promise<any> {
  domain?: ISumanTestCaseDomain | ISumanEachHookDomain | ISumanAllHookDomain
}

export interface ISumanDomain extends Domain {
  testDescription?: string;
  isSumanDomain?: boolean;
  dispose: any
}

export interface ISumanTestCaseDomain extends ISumanDomain {
  sumanTestCase?: boolean,
  sumanTestName?: string
}

export interface ISumanEachHookDomain extends ISumanDomain {
  sumanEachHook?: boolean,
  sumanEachHookName?: string
}

export interface ISumanAllHookDomain extends ISumanDomain {
  sumanAllHook?: boolean,
  sumanAllHookName?: string
}

export declare enum BrowserTypes {
  Firefox,
  Chrome,
}

export interface ISumanConfWatchPerItem {
  exec: string,
  confOverride?: Partial<ISumanConfig>,
  includes?: string | Array<string | RegExp>,
  excludes?: string | Array<string | RegExp>,
  include?: string | Array<string | RegExp>,
  exclude?: string | Array<string | RegExp>,
}

export interface ISumanConfWatchPer {
  [key: string]: ISumanConfWatchPerItem
}

export interface ISumanConfigWatch {
  options: Object,
  per: ISumanConfWatchPer
}

export interface ISumanConf {
  matchAny: any[];
  matchNone: RegExp[];
  matchAll: RegExp[];
  testDir: string;
  testSrcDir: string;
  testTargetDir: string;
  sumanHelpersDir: string;
  uniqueAppName: string;
  browser: string;
  autoLoggingPre: boolean;
  autoLoggingPost: boolean;
  autoLoggingIoc: boolean;
  autoLoggingHooks: boolean;
  installSumanExtraDeps: boolean;
  autoLoggingTestCases: boolean;
  isLogChildStdout: boolean;
  isLogChildStderr: boolean;
  includeSumanGlobalsInPath: boolean;
  useSumanUtilityPatches: boolean;
  useTAPOutput: boolean;
  errorsOnly: boolean;
  replayErrorsAtRunnerEnd: boolean;
  logStdoutToTestLogs: boolean;
  allowArrowFunctionsForTestBlocks: boolean;
  alwaysUseRunner: boolean;
  enforceGlobalInstallationOnly: boolean;
  enforceLocalInstallationOnly: boolean;
  sourceTopLevelDepsInPackageDotJSON: boolean;
  enforceTestCaseNames: boolean;
  enforceBlockNames: boolean;
  enforceHookNames: boolean;
  bail: boolean;
  bailRunner: boolean;
  useBabelRegister: boolean;
  transpile: boolean;
  executeRunnerCWDAtTestFile: boolean;
  sendStderrToSumanErrLogOnly: boolean;
  useSuiteNameInTestCaseOutput: boolean;
  ultraSafe: boolean;
  verbose: boolean;
  checkMemoryUsage: boolean;
  fullStackTraces: boolean;
  disableAutoOpen: boolean;
  suppressRunnerOutput: boolean;
  allowCollectUsageStats: boolean;
  highestPerformance: boolean;
  saveLogsForThisManyPastRuns: number;
  verbosity: number;
  maxParallelProcesses: number;
  resultsCapCount: number;
  resultsCapSize: number;
  defaultHookTimeout: number;
  defaultTestCaseTimeout: number;
  timeoutToSearchForAvailServer: number;
  defaultDelayFunctionTimeout: number;
  defaultChildProcessTimeout: number;
  defaultTestSuiteTimeout: number;
  expireResultsAfter: number;
  coverage: {
    coverageDir: string;
    nyc: {
      use: boolean;
    };
    istanbul: {};
  };
  watch: {
    '//tests': {
      'default': {
        script: (p: any) => string;
        include: any[];
        exclude: string[];
      };
    };
    '//project': {
      'default': {
        script: string;
        include: any[];
        exclude: string[];
      };
    };
  };
  reporters: {
    'tap': string;
  };
  servers: {
    '*default': {
      host: string;
      port: number;
    };
    '###': {
      host: string;
      port: number;
    };
  };
  babelRegisterOpts: {
    ignore: RegExp;
    extensions: string[];
  };
}

export interface ISumanConfigOverridable {
  [key: string]: any,
  
}

export interface ISumanConfig {

  [key: string]: any,

  DEFAULT_PARALLEL_TOTAL_LIMIT: number,
  DEFAULT_PARALLEL_BLOCK_LIMIT: number,
  DEFAULT_PARALLEL_TEST_LIMIT: number,

  matchAny: Array<RegExp | string>,
  matchNone: Array<RegExp | string>,
  matchAll: Array<RegExp | string>,

  //string
  testDir: string,
  testSrcDir: string,
  testTargetDir: string,
  sumanHelpersDir: string,
  uniqueAppName: string,
  browser: BrowserTypes,

  //boolean
  useSumanWatch: boolean,
  installSumanExtraDeps: boolean,
  includeSumanGlobalsInPath: boolean,
  useSumanUtilityPatches: boolean,
  useTAPOutput: boolean,
  errorsOnly: boolean,
  replayErrorsAtRunnerEnd: boolean,
  logStdoutToTestLogs: boolean,
  allowArrowFunctionsForTestBlocks: boolean,
  alwaysUseRunner: boolean,
  enforceGlobalInstallationOnly: boolean,
  enforceLocalInstallationOnly: boolean,
  sourceTopLevelDepsInPackageDotJSON: boolean,
  enforceTestCaseNames: boolean,
  enforceBlockNames: boolean,
  enforceHookNames: boolean,
  bail: boolean,
  bailRunner: boolean,
  useBabelRegister: boolean,
  transpile: boolean,
  executeRunnerCWDAtTestFile: boolean,
  sendStderrToSumanErrLogOnly: boolean,
  useSuiteNameInTestCaseOutput: boolean,
  ultraSafe: boolean,
  verbose: boolean,
  checkMemoryUsage: boolean,
  fullStackTraces: boolean,
  disableAutoOpen: boolean,
  suppressRunnerOutput: boolean,
  allowCollectUsageStats: boolean,

  //integers
  saveLogsForThisManyPastRuns: number,
  verbosity: number,
  maxParallelProcesses: number,
  resultsCapCount: number,
  resultsCapSize: number,

  //integers in millis
  defaultHookTimeout: number,
  defaultTestCaseTimeout: number,
  timeoutToSearchForAvailServer: number,
  defaultDelayFunctionTimeout: number,
  defaultChildProcessTimeout: number,
  defaultTestSuiteTimeout: number,
  expireResultsAfter: number,

  watch: ISumanConfigWatch

}
