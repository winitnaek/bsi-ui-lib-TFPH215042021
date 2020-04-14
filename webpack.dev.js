const merge = require('webpack-merge');
const WebpackShellPlugin = require('webpack-shell-plugin');
const baseConfig = require('./webpack.common.js');
var path = require('path');
const BUILD_DIR = path.resolve(__dirname, 'dist');

if (process.env.NODE_ENV === 'development') {
  //baseConfig.plugins.push(new WebpackShellPlugin({onBuildEnd:['node ./uitests/server/express.js']}));
}
module.exports = merge(baseConfig, {
  devtool: 'source-map',
});