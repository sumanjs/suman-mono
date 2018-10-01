
const path = require('path');

module.exports = {

  // entry: ['babel-polyfill', './lib/index.js'],
  entry: ['./node_modules/suman/lib/index.js'],
  output: {
    path: path.resolve(__dirname + '/dist'),
    filename: 'suman.js'
  },

  module: {

    rules: [

      {
        //ignore all .ts and all .d.ts files, etc.
        test: /^\.ts$/,
        loader: 'ignore-loader'
      },
      {
        test: new RegExp('^' + path.resolve(__dirname + '/lib/cli-commands/') + '.*'),
        loader: 'ignore-loader'
      },
      {
        test: new RegExp('^' + path.resolve(__dirname + '/suman.conf.js')),
        loader: 'ignore-loader'
      }
    ]
  },

  resolve: {
    alias: {
      fs: require.resolve('suman-browser-polyfills/modules/fs'),
      process: require.resolve('suman-browser-polyfills/modules/process'),
    },
    extensions: ['.js']
  },

  node: {
    assert: true,
    buffer: false,
    child_process: 'empty',
    cluster: 'empty',
    console: false,
    constants: true,
    crypto: 'empty',
    dgram: 'empty',
    dns: 'mock',
    domain: true,
    events: true,
    // fs: 'empty',
    http: true,
    https: true,
    module: 'empty',
    net: 'mock',
    os: true,
    path: true,
    process: false,
    punycode: true,
    querystring: true,
    readline: 'empty',
    repl: 'empty',
    stream: true,
    string_decoder: true,
    timers: true,
    tls: 'mock',
    tty: true,
    url: true,
    util: true,
    v8: 'mock',
    vm: true,
    zlib: 'empty',
  }
};
