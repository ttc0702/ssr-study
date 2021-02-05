const path = require('path')
const nodeExternals = require('webpack-node-externals');
const { merge } = require('webpack-merge')
const config = require('./webpack.base')

const serverConfig = {
  // 告诉 webpack 打包的是 node 环境中的代码
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  entry: './src/server/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
}

module.exports = merge(config, serverConfig)