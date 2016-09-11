var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
  development: {
    db: 'mongodb://localhost/knifeplane',
    rootPath: rootPath,
    port: process.env.PORT || 3000
  },
  production: {
    db: 'mongodb://localhost/knifeplane',
    rootPath: rootPath,
    port: process.env.PORT || 80
  }
};