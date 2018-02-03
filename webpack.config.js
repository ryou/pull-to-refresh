const path = require('path');

module.exports = {
  entry: {
    pulltorefresh: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
