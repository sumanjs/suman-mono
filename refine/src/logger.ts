'use strict';

import chalk from 'chalk';

export const log = {
  info: console.log.bind(console, chalk.gray.bold('suman-r/info:')),
  warning: console.error.bind(console, chalk.yellow('suman-r/warning:')),
  error: console.error.bind(console, chalk.redBright('suman-r/error:')),
  good: console.log.bind(console, chalk.cyan('suman-r/good:')),
  veryGood: console.log.bind(console, chalk.green('suman-r/very-good:'))
};

export default log;
