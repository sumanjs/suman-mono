const cl = require('chrome-launcher');
const util = require('util');

cl.launch({
  startingUrl: `http://yahoo.com`,
  chromeFlags: ['--auto-open-devtools-for-tabs', '--remote-debugging-port=9222'],
  enableExtensions: true
})
.then(c => {

  console.log('done');
  console.log(util.inspect(c));

});