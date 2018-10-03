'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');
const pragmatik = require('pragmatik');
const async = require("async");
const _suman = global.__suman = (global.__suman || {});
const make_start_suite_1 = require("./make-start-suite");
const makeRunChild = function (val) {
    return function runChild(child, cb) {
        child._run(val, cb);
    };
};
exports.TestBlockSymbols = {
    bindExtras: Symbol('bindExtras'),
    getInjections: Symbol('bindExtras'),
    children: Symbol('children'),
    tests: Symbol('tests'),
    parallelTests: Symbol('parallelTests'),
    befores: Symbol('befores'),
    beforeBlocks: Symbol('beforeBlocks'),
    beforesFirst: Symbol('beforesFirst'),
    beforesLast: Symbol('beforesLast'),
    beforeEaches: Symbol('beforeEaches'),
    afters: Symbol('afters'),
    afterBlocks: Symbol('afterBlocks'),
    aftersLast: Symbol('aftersLast'),
    aftersFirst: Symbol('aftersFirst'),
    afterEaches: Symbol('afterEaches'),
    injections: Symbol('injections'),
    getAfterAllParentHooks: Symbol('getAfterAllParentHooks'),
};
let id = 1;
const incr = function () {
    return id++;
};
class TestBlock {
    constructor(obj) {
        const sumanOpts = _suman.sumanOpts;
        const { suman, gracefulExit, handleBeforesAndAfters, notifyParent } = obj;
        this.__suiteSuman = suman;
        this.__startSuite = make_start_suite_1.makeStartSuite(suman, gracefulExit, handleBeforesAndAfters, notifyParent);
        this.opts = obj.opts;
        this.testId = incr();
        this.isSetupComplete = false;
        let parallel = obj.opts.parallel;
        let mode = obj.opts.mode;
        let fixed = this.fixed = (this.opts.fixed || false);
        this.parallel = (sumanOpts.parallel && !fixed) || (!sumanOpts.series && (parallel === true || mode === 'parallel'));
        this.skipped = this.opts.skip || false;
        this.only = this.opts.only || false;
        this.filename = suman.filename;
        this.childCompletionCount = 0;
        this.completedChildrenMap = new Map();
        this.injectedValues = {};
        this.interface = suman.interface;
        this.desc = this.title = obj.desc;
        this[exports.TestBlockSymbols.children] = [];
        this[exports.TestBlockSymbols.tests] = [];
        this[exports.TestBlockSymbols.parallelTests] = [];
        this[exports.TestBlockSymbols.befores] = [];
        this[exports.TestBlockSymbols.beforeBlocks] = [];
        this[exports.TestBlockSymbols.beforesFirst] = [];
        this[exports.TestBlockSymbols.beforesLast] = [];
        this[exports.TestBlockSymbols.afters] = [];
        this[exports.TestBlockSymbols.afterBlocks] = [];
        this[exports.TestBlockSymbols.aftersFirst] = [];
        this[exports.TestBlockSymbols.aftersLast] = [];
        this[exports.TestBlockSymbols.beforeEaches] = [];
        this[exports.TestBlockSymbols.afterEaches] = [];
        this[exports.TestBlockSymbols.injections] = [];
        this[exports.TestBlockSymbols.getAfterAllParentHooks] = [];
    }
    getInjections() {
        return this[exports.TestBlockSymbols.injections];
    }
    getChildren() {
        return this[exports.TestBlockSymbols.children];
    }
    getTests() {
        return this[exports.TestBlockSymbols.tests];
    }
    getParallelTests() {
        return this[exports.TestBlockSymbols.parallelTests];
    }
    getBefores() {
        return this[exports.TestBlockSymbols.befores];
    }
    getBeforeBlocks() {
        return this[exports.TestBlockSymbols.beforeBlocks];
    }
    getBeforesFirst() {
        return this[exports.TestBlockSymbols.beforesFirst];
    }
    getBeforesLast() {
        return this[exports.TestBlockSymbols.beforesLast];
    }
    getBeforeEaches() {
        return this[exports.TestBlockSymbols.beforeEaches];
    }
    getAftersFirst() {
        return this[exports.TestBlockSymbols.aftersFirst];
    }
    getAftersLast() {
        return this[exports.TestBlockSymbols.aftersLast];
    }
    getAfters() {
        return this[exports.TestBlockSymbols.afters];
    }
    getAfterBlocks() {
        return this[exports.TestBlockSymbols.afterBlocks];
    }
    getAfterEaches() {
        return this[exports.TestBlockSymbols.afterEaches];
    }
    getAfterAllParentHooks() {
        return this[exports.TestBlockSymbols.getAfterAllParentHooks];
    }
    getAfterBlockList() {
        let v = this, ret = [];
        while (v = v.parent) {
            v.getAfterBlocks().reverse().forEach(function (z) {
                ret.unshift(z);
            });
        }
        return ret;
    }
    getBeforeBlockList() {
        let v = this, ret = [];
        while (v = v.parent) {
            v.getBeforeBlocks().reverse().forEach(function (z) {
                ret.unshift(z);
            });
        }
        return ret;
    }
    resume() {
        const args = Array.from(arguments);
        const self = this;
        process.nextTick(function () {
            self.__resume.apply(null, args);
        });
    }
    toString() {
        return 'Suman test block: ' + this.desc;
    }
    invokeChildren(val, start) {
        async.eachSeries(this.getChildren(), makeRunChild(val), start);
    }
    bindExtras() {
        return this.__suiteSuman.ctx = this;
    }
    mergeBefores() {
        while (this[exports.TestBlockSymbols.beforesFirst].length > 0) {
            this[exports.TestBlockSymbols.befores].unshift(this[exports.TestBlockSymbols.beforesFirst].pop());
        }
        while (this[exports.TestBlockSymbols.beforesLast].length > 0) {
            this[exports.TestBlockSymbols.befores].push(this[exports.TestBlockSymbols.beforesLast].shift());
        }
    }
    mergeAfters() {
        while (this[exports.TestBlockSymbols.aftersFirst].length > 0) {
            this[exports.TestBlockSymbols.afters].unshift(this[exports.TestBlockSymbols.aftersFirst].shift());
        }
        while (this[exports.TestBlockSymbols.aftersLast].length > 0) {
            this[exports.TestBlockSymbols.afters].push(this[exports.TestBlockSymbols.aftersLast].shift());
        }
    }
    getHooks() {
        return this.__suiteSuman.containerProxy;
    }
    set(k, v) {
        if (arguments.length < 2) {
            throw new Error('Must pass both a key and value to "set" method.');
        }
        return this.shared.set(k, v);
    }
    get(k) {
        if (arguments.length < 1) {
            return this.shared.getAll();
        }
        return this.shared.get(k);
    }
    getValues(...args) {
        return args.map(k => {
            return this.shared.get(k);
        });
    }
    getMap(...args) {
        const ret = {};
        args.forEach(k => {
            ret[k] = this.shared.get(k);
        });
        return ret;
    }
    getInjectedValue(key) {
        if (key in this.injectedValues) {
            return this.injectedValues[key];
        }
        else if (this.parent) {
            return this.parent.getInjectedValue(key);
        }
    }
    getInjectedValues(...args) {
        return args.map(a => {
            return this.getInjectedValue(a);
        });
    }
    getInjectedMap(...args) {
        const ret = {};
        args.forEach(a => {
            ret[a] = this.getInjectedValue(a);
        });
        return ret;
    }
    getSourced() {
        const ret = {};
        let v = this;
        while (v) {
            let ioc = v.ioc;
            Object.keys(ioc).forEach(function (k) {
                if (!(k in ret)) {
                    ret[k] = ioc[k];
                }
            });
            v = this.parent;
        }
        return ret;
    }
    getSourcedValue(v) {
        if (v in this.ioc) {
            return this.ioc[v];
        }
        else if (this.parent) {
            return this.parent.getSourcedValue(v);
        }
    }
    getSourcedValues(...args) {
        return args.map(a => {
            return this.getSourcedValue(a);
        });
    }
    getSourcedMap(...args) {
        const ret = {};
        args.forEach(a => {
            ret[a] = this.getSourcedValue(a);
        });
        return ret;
    }
}
exports.TestBlock = TestBlock;
