

## How to create your own Suman run plugin

Suman should have good default plugins for TypeScript and Babel transpilation.
However, if you wish to use different kinds of transpilation for these transpilers,
or if you wish to create a transform to compile Golang, Java, etc, read on.
The index.sh file of your plugin will be responsible for executing your tests
with the executable of your choice (Java, Go). The index.js file is simply responsible for loading
your index.sh file, the latter doing nearly all the work.

Suman run plugins can be loaded in a Node.js runtime via:

```javascript
require('suman-run-plugins/plugins/x')
```

this will load the index.js file of your plugin.
Because of the structure of this repo, 'x' will be a unique name.


## API Contract

1. <b>Your index.js file should have the following contract:</b>

<br>

```javascript

const fs = require('fs');
const path = require('path');

exports.getTransformStream = function () {
  return fs.createReadStream(exports.getTransformPath());
};

exports.getTransformPath = function(){
  return path.resolve(__dirname + '/index.sh');
};

```

<br>
2. <b> your index.sh file must be able to handle a JSON array of test paths</b>
<br>
 => the JSON array is an env variable with name `${SUMAN_TEST_PATHS}`
 => these test paths are absolute filepaths.

<br>
3. <b>your index.sh file must use the correct exit code.</b> 
<br>
To ensure this, the best thing to do
is to make the last line of your index.sh file the command which runs your tests.

<br>
4. <b>Your plugin should pass the following test:</b>
<br>

<br>
4. <b>Your index.sh file should be executable, but not readable or writable.</b>
<br>

```suman-tools --test-run-plugin=<plugin-name>```


When you want to actually use your plugin, you would do this:


// @config.json
{
  "@run": {
    "plugin": {
      "location": "npm",
      "value": "suman-run-plugins/plugins/x"
    }
  }
}


Suman will then use this plugin to execute any tests in subdirectories that match /@target/


5. Suman run plugins should be simple, serial and bug-free:

 @run.sh should be written with simple serial processing and not attempt to do more
 work than 1 processor could do. This allows Suman to maximize speed by parallelizing other processses.
 
 No branching logic is permitted in run files, 
 except to installing missing dependencies if they do not exist.