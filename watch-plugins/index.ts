'use strict';

import fs = require('fs');
import path = require('path');

//////////////////////////////////////////////////////////////////////

export interface IEnvObject {  // for example, this is the type of `process.env`
  [key: string]: string
}

export interface IPluginValues {
  [key: string]: ISumanWatchPlugin
}

export interface ISumanWatchPluginModule {
  exportName: string,
  value: ISumanWatchPlugin,
  getValue: (version?: string, input?: Partial<ISumanWatchPlugin>) => ISumanWatchPlugin
}

export interface ISumanWatchPluginModules {
  [key: string]: ISumanWatchPluginModule
}

export interface ISumanWatchPlugin {
  version: string,
  execTests?: string, // if the plugin is good, it can dictate how to run tests too
  pluginName: string, // the unique name of the plugin
  isSumanWatchPluginValue: boolean,  // constant that tells suman what is what
  pluginCwd: string,  // when the plugin watch process starts, this is it's current working dir
  pluginEnv: IEnvObject, // when the plugin watch process starts, this will be added to process.env
  pluginExec: string,  //  this string is run via bash to start the plugin watch process
  stdoutStartTranspileRegex: RegExp, // this regex is used to match against stdout
  stdoutEndTranspileRegex: RegExp, // this regex is used to match against stdout
}

export const plugins = {} as ISumanWatchPluginModules;
const modules = path.resolve(__dirname + '/modules');

fs.readdirSync(modules).forEach(function (item) {
  const file = path.resolve(modules + '/' + item);
  const mod = require(file) as ISumanWatchPluginModule;
  plugins[mod.exportName] = mod;
});


