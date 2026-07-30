
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {

  plugins: [
    new NodePolyfillPlugin({
      onlyAliases: [
        'assert',
        'constants',
        'domain',
        'events',
        'http',
        'https',
        'os',
        'path',
        'punycode',
        'querystring',
        'stream',
        'string_decoder',
        'timers',
        'tty',
        'url',
        'util',
        'vm'
      ]
    })
  ],

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
    fallback: {
      buffer: false,
      child_process: false,
      cluster: false,
      console: false,
      crypto: false,
      dgram: false,
      dns: false,
      module: false,
      net: false,
      readline: false,
      repl: false,
      tls: false,
      v8: false,
      zlib: false
    },
    extensions: ['.js']
  },

  node: {
    global: true
  }
};
