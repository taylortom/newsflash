const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

const DIST_DIR = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  // mode: 'production',
  output: {
    path: DIST_DIR,
    filename: 'js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'assets',
        to: path.join(DIST_DIR, 'assets')
      }
    ]),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false
    }),
    new VueLoaderPlugin(),
  ],
};
