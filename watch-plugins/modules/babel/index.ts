'use strict';

//dts
import {ISumanWatchPlugin, IEnvObject, IPluginValues} from "../../index";

//core
import path = require('path');
import assert = require('assert');

//npm
import chalk from 'chalk';
import su = require('suman-utils');

//project
import log from '../../lib/logging';
import {utils} from "../../lib/util";

//////////////////////////////////////////////////////////////////////

export const exportName = String(path.basename(__dirname)).toLowerCase().replace(/[^a-zA-Z]/, '');
export const isSumanWatchPluginModule = true;

const values: IPluginValues = Object.freeze({

  '6.24.1': {
    version: '6.24.1',
    isSumanWatchPluginValue: true,
    pluginName: exportName + '-watch-plugin',
    pluginCwd: process.cwd(),
    pluginEnv: process.env,
    pluginExec: 'set -e; rm -rf @target; babel -w @src --out-dir=@target',
    stdoutStartTranspileRegex: /currently unknown matching string (sad face)/i,
    stdoutEndTranspileRegex: /\s{1,3}->\s{1,3}/i,
  },

});

export const getValue = function (version?: string, input?: Partial<ISumanWatchPlugin>) {

  if (su.isObject(version)) {
    if(su.vgt(6)){
      log.warning(`suman-watch-plugin with name '${exportName}',` +
        ` is using the latest version of the plugin because no desired version was passed as the first argument to getValue().`);
    }
    input = version as Partial<ISumanWatchPlugin>;
    version = 'latest';
  }

  return utils.getValue(version, input, exportName, values);
};

utils.validatePluginValues(values);

exports[exportName + 'Plugin'] = module.exports;
