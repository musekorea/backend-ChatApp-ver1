const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  watch: false,
  entry: './src/public/js/app.js',
  plugins: [new MiniCssExtractPlugin({ filename: 'scss/temp.css' })],
  mode: 'production',
  output: {
    filename: 'js/app.js',
    path: path.resolve(__dirname, 'client'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
