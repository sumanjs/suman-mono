'use strict';

const fs = require('../dest/fs');
const global = require('../dest/fs');

const strm = fs.createWriteStream();
console.log('strm => ', strm);


fs.writeFile(function(err){

  if(err){
    console.error(err);
  }
   console.log('well here we go.');
});


