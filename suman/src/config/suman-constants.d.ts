export declare const constants: Readonly<{
    SUMAN_ISSUE_TRACKER_URL: string;
    SUMAN_TYPES_ROOT_URL: string;
    DEFAULT_TRANSFORM_CONCURRENCY: number;
    DEFAULT_PARALLEL_TOTAL_LIMIT: number;
    DEFAULT_PARALLEL_TEST_LIMIT: number;
    DEFAULT_PARALLEL_BLOCK_LIMIT: number;
    DEFAULT_CHILD_PROCESS_TIMEOUT: number;
    OLDEST_SUPPORTED_NODE_VERSION: string;
    DEBUGGING_ENV: {
        name: string;
        value: string;
    };
    SUMAN_SERVER_MESSAGE: string;
    UNKNOWN_INJECT_HOOK_NAME: string;
    SUMAN_HOOK_FATAL_WARNING_MESSAGE: string;
    SUMAN_HOOK_FATAL_MESSAGE: string;
    SUMAN_HARD_LIST: string[];
    CORE_MODULE_LIST: any;
    CLI_EXIT_CODES: {
        NO_GROUP_NAME_MATCHED_COMMAND_LINE_INPUT: number;
    };
    RUNNER_EXIT_CODES: {
        NO_TEST_FILE_OR_DIR_SPECIFIED: number;
        ERROR_INVOKING_NETWORK_LOG_IN_RUNNER: number;
        UNEXPECTED_FATAL_ERROR: number;
        TIMED_OUT_AFTER_ALL_PROCESSES_EMIT_EXIT: number;
        NO_TEST_FILES_MATCHED_OR_FOUND: number;
        UNCAUGHT_EXCEPTION: number;
    };
    EXIT_CODES: {
        SUCCESSFUL_RUN: number;
        WHOLE_TEST_SUITE_SKIPPED: number;
        GREP_SUITE_DID_NOT_MATCH: number;
        COULD_NOT_LOAD_A_REPORTER: number;
        FILE_OR_DIRECTORY_DOES_NOT_EXIST: number;
        SUMAN_PRE_NOT_FOUND_IN_YOUR_PROJECT: number;
        SUMAN_HELPER_FILE_DOES_NOT_EXPORT_EXPECTED_FUNCTION: number;
        BAD_GREP_SUITE_OPTION: number;
        SUMAN_UNCAUGHT_EXCEPTION: number;
        BAD_CONFIG_OR_PROGRAM_ARGUMENTS: number;
        UNEXPECTED_NON_FATAL_ERROR: number;
        TEST_CASE_FAIL: number;
        INVALID_ARROW_FUNCTION_USAGE: number;
        BAD_COMMAND_LINE_OPTION: number;
        UNEXPECTED_FATAL_ERROR: number;
        FATAL_TEST_ERROR: number;
        FATAL_HOOK_ERROR: number;
        SUITE_TIMEOUT: number;
        SUITE_BAIL: number;
        INTEGRANT_VERIFICATION_FAILURE: number;
        UNKNOWN_RUNNER_CHILD_PROCESS_STATE: number;
        ERROR_IN_ROOT_SUITE_BLOCK: number;
        IOC_DEPS_ACQUISITION_ERROR: number;
        EXPORT_TEST_BUT_RAN_TEST_FILE_DIRECTLY: number;
        DELAY_NOT_REFERENCED: number;
        INTEGRANT_VERIFICATION_ERROR: number;
        ERROR_CREATED_SUMAN_OBJ: number;
        IOC_PASSED_TO_SUMAN_INIT_BAD_FORM: number;
        ERROR_ACQUIRING_IOC_DEPS: number;
        INVALID_RUNNER_CHILD_PROCESS_STATE: number;
        NO_TIMESTAMP_AVAILABLE_IN_TEST: number;
        ERROR_CREATED_NETWORK_LOG: number;
        ERROR_CREATING_RESULTS_DIR: number;
        COULD_NOT_FIND_CONFIG_FROM_PATH: number;
        TEST_ERROR_AND_BAIL_IS_TRUE: number;
        ERROR_PASSED_AS_FIRST_ARG_TO_DELAY_FUNCTION: number;
        DELAY_FUNCTION_TIMED_OUT: number;
        ERROR_IN_CHILD_SUITE: number;
        OPTS_PLAN_NOT_AN_INTEGER: number;
        UNEXPECTED_FATAL_ERROR_DOMAIN_CAUGHT: number;
        HOOK_ERROR_AND_BAIL_IS_TRUE: number;
        HOOK_TIMED_OUT_ERROR: number;
        UNCAUGHT_EXCEPTION_BEFORE_ONCE_POST_INVOKED: number;
        UNCAUGHT_EXCEPTION_AFTER_ONCE_POST_INVOKED: number;
        ASYNCHRONOUS_CALL_OF_TEST_DOT_DESCRIBE: number;
        COULD_NOT_CREATE_LOG_DIR: number;
        COULD_NOT_LOCATE_SUMAN_HELPERS_DIR: number;
        INTEGRANT_ACQUISITION_TIMEOUT: number;
        EXPECTED_EXIT_CODE_NOT_MET: number;
        ASYCNCHRONOUS_REGISTRY_OF_TEST_BLOCK_METHODS: number;
        HOOK_DID_NOT_THROW_EXPECTED_ERROR: number;
        TEST_FILE_TIMEOUT: number;
        IOC_STATIC_ACQUISITION_ERROR: number;
        PRE_VALS_ERROR: number;
    };
    ERROR_MESSAGES: {
        INVALID_FUNCTION_TYPE_USAGE: string;
    };
    runner_message_type: {
        BROWSER_FINISHED: string;
        FATAL: string;
        FATAL_MESSAGE_RECEIVED: string;
        TABLE_DATA: string;
        INTEGRANT_INFO: string;
        LOG_RESULT: string;
        WARNING: string;
        NON_FATAL_ERR: string;
        MAX_MEMORY: string;
        TABLE_DATA_RECEIVED: string;
    };
    warnings: {
        NO_DONE_WARNING: string;
        RETURNED_VAL_DESPITE_CALLBACK_MODE: string;
        TEST_CASE_TIMED_OUT_ERROR: string;
        HOOK_TIMED_OUT_ERROR: string;
        DELAY_TIMED_OUT_ERROR: string;
    };
    tableData: {
        SUITES_DESIGNATOR: {
            name: string;
            default: string;
        };
        TEST_CASES_DESIGNATOR: {
            name: string;
            default: string;
        };
        TEST_CASES_TOTAL: {
            name: string;
            default: string;
        };
        TEST_CASES_PASSED: {
            name: string;
            default: string;
        };
        TEST_CASES_FAILED: {
            name: string;
            default: string;
        };
        TEST_CASES_SKIPPED: {
            name: string;
            default: string;
        };
        TEST_CASES_STUBBED: {
            name: string;
            default: string;
        };
        TEST_FILE_MILLIS: {
            name: string;
            default: any;
        };
        TEST_SUITE_EXIT_CODE: {
            name: string;
            default: string;
        };
    };
}>;
