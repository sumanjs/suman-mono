'use strict';

//npm
const colors = require('colors/safe');

//project
const _suman = global.__suman = (global.__suman || {});

///////////////////////////////////////////////////////////////////////////

module.exports = function (err) {

  if (String(err.stack || err).match(/backspacing/)) {
    console.warn(' => "backspacing" error caught in rejection-handler');
    return;
  }

  console.error(
    '\n\n\n\n',
    colors.bgRed.white.bold(' => Suman implemenation error => Error captured by catch block =>'),
    '\n',
    colors.red(err.stack || err),
    '\n\n\n'
  );

};
