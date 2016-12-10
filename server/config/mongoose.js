var mongoose = require('mongoose'),
  userModel = require('../models/User'),
  pyramidModel = require('../models/Pyramid'),
  challengeModel = require('../models/Challenge'),
  notificationsModel = require('../models/Notification');


module.exports = function (config) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error…'));
  db.once('open', function callback() {
    console.log('wannaplayme db opened');
  });

  userModel.createDefaultUsers();
  pyramidModel.createDefaultPyramid();
};