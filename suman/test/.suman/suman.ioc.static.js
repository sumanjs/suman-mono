'use strict';
Object.defineProperty(exports, "__esModule", { value: true });

console.log('static ioc file required.');

exports.default = (function ($core, $deps) {
    return {
        dependencies: {
            'chuck': function () {
              console.log('berry loaded.');
                return 'berry';
            },
            'mark': function (cb) {
              console.log('rutherford loaded.');
                cb(null, 'rutherfurd');
            },
        }
    };
});
