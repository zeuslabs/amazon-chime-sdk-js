const path = require('path');

module.exports = {
  entry: './build/entry.js',
  output: {
    path: path.resolve(__dirname, 'single-js'),
    filename: 'amazon-chime-sdk.js'
  },
  mode: 'production'
};
