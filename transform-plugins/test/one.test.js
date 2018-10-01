

const stp = require('suman-transform-plugins/plugins/typescript-std');

const fs = require('fs');
console.log(stp.getTransformPath());



fs.createReadStream(stp.getTransformPath(),{encoding: 'utf8'}).on('data', function(d){
  console.log(d);
});