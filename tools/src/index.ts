#!/usr/bin/env node
'use strict';

//core
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as assert from 'assert';
import * as cp from 'child_process';

//npm
const dashdash = require('dashdash');
const {findProjectRoot} = require('residence');
import chalk from 'chalk';

//project

let options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Print this help and exit.'
  },
  {
    names: ['extract-json-array'],
    type: 'string',
    help: 'Use this option to send each item of a JSON array to stdout.'
  },
  {
    names: ['is-symlinked-globally'],
    type: 'string',
    help: 'Use this option to send each item of a JSON array to stdout.'
  },
  {
    names: ['to-json'],
    type: 'string',
    help: 'Use this option to write a JSON string to stdout from x, given --to-json="x".'
  },
  {
    names: ['is-symlinked-locally'],
    type: 'string',
    help: 'Use this option to send each item of a JSON array to stdout.'
  },
];

let opts, parser = dashdash.createParser({options: options});

try {
  opts = parser.parse(process.argv);
} catch (e) {
  console.error(chalk.red(' => suman-tools usage error: %s'), e.message);
  process.exit(1);
}

if (opts.help) {
  let help = parser.help({includeEnv: true}).trimRight();
  console.log('usage: node foo.js [OPTIONS]\n'
    + 'options:\n'
    + help);
  process.exit(0);
}

if (opts.extract_json_array) {
  const arr = JSON.parse(opts.extract_json_array);
  arr.forEach(function (a: string) {
    console.log(a);
  });
  process.exit(0);
}

if (opts.to_json) {
  console.log(opts.to_json);
  process.exit(0);
}

const root = findProjectRoot(process.cwd());

if (opts.is_symlinked_locally) {
  try {
    const p = path.resolve(root + '/node_modules/' + String(opts.is_symlinked_locally).trim());
    const stats = fs.lstatSync(p);
    let v = stats.isSymbolicLink() ? 'affirmative' : 'negative';
    console.log(v);
    process.exit(0);
  }
  catch (err) {
    if (/no such file or directory/.exec(err.message)) {
      console.log('negative');
      process.exit(0);
    }
    console.error('\n', err.stack, '\n');
    process.exit(1);
  }

}

if (opts.is_symlinked_globally) {
  try {
    const npmRoot = String(cp.execSync('npm root -g', {encoding: 'utf8'})).trim();
    const p = path.resolve(npmRoot + '/' + String(opts.is_symlinked_globally).trim());
    const stats = fs.lstatSync(p);
    let v = stats.isSymbolicLink() ? 'affirmative' : 'negative';
    console.log(v);
    process.exit(0);
  }
  catch (err) {
    if (/no such file or directory/.exec(err.message)) {
      console.log('negative');
      process.exit(0);
    }
    console.error('\n', err.stack, '\n');
    process.exit(1);
  }
}

throw new Error('no option selected/matched.');