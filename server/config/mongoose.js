var mongoose = require('mongoose'),
  userModel = require('../models/User'),
  pyramidModel = require('../models/Pyramid');

module.exports = function (config) {
  mongoose.connect(config.db);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error…'));
  db.once('open', function callback() {
    console.log('employeedirectory db opened');
  });

  userModel.createDefaultUsers();
  pyramidModel.createDefaultPyramid();
};