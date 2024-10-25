const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

let config =  {
  mode: process.env.NODE_ENV || 'development',
  entry: './core/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              // ['@babel/preset-env', { targets: { node: 'current' } }],
              ['@babel/preset-env', { targets: 'defaults' }],
            ],
            plugins: ['@babel/plugin-transform-runtime', "@babel/plugin-proposal-class-properties"],
          },
        },
      },
    ],
  },
  plugins: [
    new NodemonPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: './core/index.html', to: "./index.html" },
        { from: './core/index.css', to: "./index.css" },
      ],
    }),
  ],
};

if(process.env.NODE_ENV === 'production') {
  config = Object.assign(config, {
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
        minify: (file, sourceMap) => {
          // https://github.com/mishoo/UglifyJS2#minify-options
          const uglifyJsOptions = {
            /* your `uglify-js` package options */
          };

          if (sourceMap) {
            uglifyJsOptions.sourceMap = {
              content: sourceMap,
            };
          }

          return require("uglify-js").minify(file, uglifyJsOptions);
        },
      })],
    },
    plugins: []
  })
}

module.exports = config;
