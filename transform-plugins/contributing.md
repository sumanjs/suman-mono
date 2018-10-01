Plugin contract:

Plugins can be loaded in a Node.js runtime via:

```javascript
require('suman-transform-plugins/plugins/x')
```

this will load the index.js file of your plugin.

Because of the structure of this repo, 'x' should be a unique name.

Your index.js file should have the following contract:

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