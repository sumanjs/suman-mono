'use strict';

//core
import cp = require('child_process');
import fs = require('fs');
import path = require('path');
import util = require('util');
import assert = require('assert');
import EE = require('events');
import os = require('os');
import domain = require('domain');

//npm
import su = require('suman-utils');

//////////////////////////////////////////////////////////////////////

//TODO: these functions should give users options to use kubernetes or docker

function run() {
  return 'docker run -it --tty=false --rm ' + this.name;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const defaults = Object.freeze({
  allowReuseImage: false,
  useContainer: true,
  run: run
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = data => {
  
  data = data || {};
  assert(typeof data === 'object', ' => Please pass in object to suman.groups.js function.');
  
  console.log('data passed to groups fn => ', data);
  
  const testDir = process.env.TEST_DIR;
  const r = path.resolve(testDir + '/groups');
  const items = fs.readdirSync(r).filter(function (p) {
    return fs.statSync(path.resolve(r + '/' + p)).isDirectory()
  });
  
  const groups = items.map(function (item) {
    
    console.log('item => ', item);
    
    return {
      
      cwd: path.resolve(r + '/' + item),
      name: path.basename(item, path.extname(item)),   // remove .sh from end
      
      getPathToScript: function () {
        return path.resolve(this.cwd + '/default.sh')
      },
      
      // dockerfilePath: path.resolve(r + '/' + item + '/Dockerfile'),
      
      dockerfilePath: path.resolve(r + '/Dockerfile'),
      
      build: function () {
        return 'cd ' + this.cwd + ' &&  docker build --file='
          + this.dockerfilePath + ' -t ' + this.name + ' . '
      },
      
      //TODO: ln -s /path/to/file /path/to/symlink
      
    }
  });
  
  return {
    
    //TODO: have to handle the case where the build has already been built -
    // don't want to rebuild container
    // put in .suman/groups/scripts
    // if pathToScript is null/undefined,
    // will read script with the same name as the group in the above dir
    
    groups: groups.map(function (item) {
      const val = Object.assign({}, defaults, data, item);
      console.log('\n val => \n', util.inspect(val));
      return val;
    })
  }
  
};

