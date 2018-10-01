'use strict';

//dts
import {IGlobalSumanObj, ISumanConfig, ISumanOpts} from "suman-types/dts/global";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
import fs = require('fs');
import path = require('path');
import su = require('suman-utils');

//npm
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const replaceStream = require('replacestream');
import async = require('async');
import _ = require('lodash');

//project
const _suman: IGlobalSumanObj = global.__suman = (global.__suman || {});
const webpackTemplatePath = path.resolve(__dirname + '/lib/html-templates/webpack.html');
const sumanTestContentRegex = /<suman-test-content>.*<\/suman-test-content>/;
const sumanLibRegex = /'<suman-build>'/;
const sumanTestRegex = /'<suman-test>'/;

///////////////////////////////////////////////////////////////////////////////////////////////////////

/*

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Webpack Test</title>
</head>
<body>

<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.26.0/polyfill.js"></script>
  <suman-test-content></suman-test-content>
  <script type="text/javascript" src="dist/suman.js"></script>
  <script type="text/javascript" src="dist/browser-tests.js"></script>

  </body>
  </html>

*/

const getTopHtml = function () {
  
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8">',
    '<title>Suman + Webpack Test</title>',
    '</head>',
    '<body>',
    '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.26.0/polyfill.js"></script>'
  ]
};

const getBottomHtml = function () {
  return [
    '</body>',
    '</html>'
  ]
};

const getEmbeddedScript = function (port: number, id: number, sumanConfigStr: string, sumanOptsStr: string) {
  
  const timestamp = Date.now();
  
  return [
    '<script>',
    `window.__suman = window.__suman || {};\n`,
    // `window.Debugger.enable();`,
    `window.__suman.SUMAN_SOCKETIO_SERVER_PORT=${port};\n`,
    `window.__suman.SUMAN_CHILD_ID=${id};\n`,
    `window.__suman.usingRunner=true;\n`,
    `window.__suman.timestamp=${timestamp};\n`,
    `window.__suman.sumanConfig=${sumanConfigStr};\n`,
    `window.__suman.sumanOpts=${sumanOptsStr};\n`,
    '</script>'
  ];
  
};

const getSumanLibScript = function (cb: Function) {
  
  let p = path.resolve(__dirname + '/dist/suman.js');
  
  fs.readFile(p, 'utf8', function (err: Error, data: string) {
    if (err) {
      return cb(err);
    }
    
    cb(null, [
      '<script>',
      String(data),
      '</script>'
    ]);
    
  });
};

const getWebpackBuild = function (sumanHelperDir: string) {
  
  return function (cb: Function) {
    
    let p = path.resolve(sumanHelperDir + '/browser/builds/browser-tests.js');
    
    fs.readFile(p, 'utf8', function (err: Error, data: string) {
      if (err) {
        return cb(err);
      }
      
      cb(null, [
        '<script>',
        String(data),
        '</script>'
      ]);
      
    });
  }
};

export const makeGetBrowserStream = function (sumanHelperDir: string, sumanConf: ISumanConfig, sumanOpts: ISumanOpts) {
  
  const sumanOptsStr = su.customStringify(sumanOpts);
  const sumanConfigStr = su.customStringify(sumanConf);
  
  return function getBrowserStream(port: number, id: number, cb: Function) {
    
    async.parallel([
        
        getSumanLibScript,
        getWebpackBuild(sumanHelperDir)
      
      ],
      
      function (err: Error, results: any) {
        
        if (err) {
          return cb(err);
        }
        
        // join all results together
        const all = <Array<Array<string>>> [
          getTopHtml(),
          getEmbeddedScript(port, id, sumanConfigStr, sumanOptsStr),
          results,
          getBottomHtml()
        ];
        
        const allStr = _.flattenDeep(all.reduce((a, b) => a.concat(b), []));
        cb(null, allStr);
        
      })
    
  }
  
};