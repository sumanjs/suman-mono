'use strict';

//dts
import {IPluginValues, ISumanWatchPlugin} from "../index";

//core
import fs = require('fs');
import path = require('path');
import assert = require('assert');

//npm
import su = require('suman-utils');
import util = require('util');
import chalk from 'chalk';
const semver = require('semver');

//project
import log from './logging';

///////////////////////////////////////////////////////////////////////////

const sortBySemverVersion = function (a: string, b: string) {
  if (semver.gt(a, b)) {
    return 1;
  }
  else if (semver.lt(a, b)) {
    return -1
  }
  return 0;
};

const getLastValue = function (values: IPluginValues, type?: string,) {

  type = type || 'semver';

  const keys = Object.keys(values);

  switch (type) {
    case 'semver':
      keys.sort(sortBySemverVersion);
  }

  const finalKey = keys[keys.length - 1];
  return values[finalKey];
};

export const utils = {

  getValue(version: string, input: Partial<ISumanWatchPlugin>, exportName: string, values: IPluginValues, versioningType?: string) {

    versioningType = versioningType || 'semver';
    const env = input.pluginEnv;
    delete input.pluginEnv; // we delete the property since we must "manually" combine it
    env && assert(su.isObject(env), 'if "pluginEnv" property exists, it must be a plain object.');

    const overrideObject = {
      isSumanWatchPluginValue: true, // this key should always be set to true
    } as Partial<ISumanWatchPlugin>;

    const keys = Object.keys(values);

    let value: ISumanWatchPlugin;
    if (version === 'latest') {
      value = getLastValue(values, versioningType);
    }
    else {
      value = utils.getValueViaSemverVersion(version, exportName, values);
    }

    if (env) {
      overrideObject.pluginEnv = Object.assign({}, process.env, value.pluginEnv, env)
    }

    return utils.validatePlugin(Object.assign({}, value, input, overrideObject), value.version);
  },

  validatePlugin(v: ISumanWatchPlugin, k: string) {

    try {
      assert(v, 'plugin value is not defined.');
      assert.equal(v.version, k, 'key version must match object version.');
      assert(v.pluginName && typeof v.pluginName === 'string', '"pluginName" property needs to be defined.');
      assert.equal(v.isSumanWatchPluginValue, true, '"isSumanWatchPluginValue" property needs to be set to true.');
      assert(v.pluginCwd && typeof v.pluginCwd === 'string', '"pluginCwd" property needs to be defined.');
      assert(v.pluginEnv && su.isObject(v.pluginEnv), '"pluginEnv" property needs to be a plain object.');
    }
    catch (err) {
      log.error('The following suman-watch-plugin is malformed =>\n', chalk.magenta.bold(util.inspect(v)));
      throw err;
    }

    return v;

  },

  validatePluginValues(values: IPluginValues) {

    Object.keys(values).forEach(function (k) {
      utils.validatePlugin(values[k], k);
    });

  },

  getValueViaSemverVersion(version: string, pluginName: string, values: IPluginValues) {

    try {
      assert(semver.valid(version));
    }
    catch (err) {
      log.error(`the semver version passed is not valid => '${version}', while looking a version of plugin with name '${pluginName}'.`);
    }

    let prev: ISumanWatchPlugin;
    const keys = Object.keys(values).sort(sortBySemverVersion);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (semver.gt(key, version)) {
        return prev || values[key];
      }
      else if (semver.lt(key, version)) {
        prev = values[key]
      }
      else {
        // should be exact same version here
        return values[key];
      }
    }

  }

};

