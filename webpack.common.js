const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// hide deprication warnings
process.noDeprecation = true;

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: [
    'jquery',
    'jquery-ui',
    'jquery-ui-css',
    './index.js',
    'whatwg-fetch',
    './style/style.scss'
  ],
  module: {
    noParse: /node_modules\/mapbox-gl\/dist\/mapbox-gl.js/,
    loaders: [
      { test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader' },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        }
      },
      {
        test: /\.(json|geojson)$/,
        loader: 'json-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  output: {
    path: `${__dirname}/dist/assets/`,
    filename: 'js/[name].min.js'
  },
  plugins: [
    new ExtractTextPlugin({ filename: 'css/[name].min.css' }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': "jquery'",
      'window.$': 'jquery',
      Popper: ['popper.js', 'default']
    }),
    new CopyWebpackPlugin([
      {
        from: `${__dirname}/src/data/KiTas_NRW.json`,
        to: `${__dirname}/dist/`
      },
      {
        from: `${__dirname}/src/index.html`,
        to: `${__dirname}/dist/`
      },
      {
        from: `${__dirname}/src/favicons`,
        to: `${__dirname}/dist/favicons`
      },
      {
        from: `${__dirname}/node_modules/gif.js/dist/gif.worker.js`,
        to: `${__dirname}/dist/`
      }
    ])
  ],
  resolve: {
    alias: {
      'jquery-ui': 'jquery-ui-dist/jquery-ui.js',
      'jquery-ui-css': 'jquery-ui-dist/jquery-ui.css'
    }
  }
};
