var mongoose = require('mongoose'),
  userModel = require('../models/User'),
  competitionModel = require('../models/Competition'),
  challengeModel = require('../models/Challenge'),
  alertsModel = require('../models/Alert');


module.exports = function (config) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error…'));
  db.once('open', function callback() {
    console.log('wannaplayme db opened');
  });

  userModel.createDefaultUsers();
  competitionModel.createDefaultCompetition();
};