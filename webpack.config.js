'use strict';
var path = require('path');

module.exports = {
  entry: {
    background: './source/claire.js',
    contentscript: './source/contentscript.js',
    options: './source/options.js',
    popup: './source/page-action-popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
};
