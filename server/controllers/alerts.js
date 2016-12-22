var Alert = require('mongoose').model('Alert');
var websockets = require('../websockets');
var _ = require('lodash');

exports.getActiveAlertsByPlayer = function (req, res) {
  Alert.find({
    'userId': req.query.userId,
    'cleared': { $ne: true }
  }).exec(function (err, alerts) {
    res.send(alerts);
  });
};

exports.createAlerts = function (alerts) {
  Alert.create(alerts, function (err) {
    if (err) {
      console.log('error creating Alerts');
    }
    websockets.broadcast('update_alerts', alerts);
  }); 
};

exports.clearAlert = function (req, res) {
  Alert.findOneAndUpdate({
    '_id': req.body.alertId
  },{
    'cleared': true
  }).exec(function (err, Alert) {
    res.send(Alert);
  });
};

exports.clearAlertsByPlayer = function (req, res) {
  Alert.update({
    'userId': req.body.userId,
    'cleared': { $ne: true }
  },{
    'cleared': true
  },{
    multi: true
  }).exec(function (err, alerts) {
    res.send(alerts);
  });
};

exports.clearAlertsOnCompletedChallenge = function (alerts) {
  _.forEach(alerts, function (alert) {
    Alert.findOneAndUpdate({
      'userId': alert.userId,
      'competitionId': alert.competitionId,
      'details.title': 'New Challenge',
      'cleared': { $ne: true }
    },{
      'cleared': true
    }).exec(function (err) {
      if (err) {
        console.log('error creating Alert');
      }
    });
  });
  websockets.broadcast('update_alerts', alerts);
};