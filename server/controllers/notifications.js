var Notification = require('mongoose').model('Notification');
var websockets = require('../websockets');

exports.getActiveNotificationsByPlayer = function (req, res) {
  Notification.find({
    'userId': req.query.userId,
    'cleared': { $ne: true }
  }).exec(function (err, notifications) {
    res.send(notifications);
  });
};

exports.createNotification = function (notificationDetails) {
  Notification.create(notificationDetails, function (err) {
    if (err) {
      console.log('error creating notification');
    }
    websockets.broadcast('notification_created', notificationDetails);
  }); 
};

exports.clearNotification = function (req, res) {
  Notification.findOneAndUpdate({
    '_id': req.body.notificationId
  },{
    'cleared': true
  }).exec(function (err, notification) {
    res.send(notification);
  });
};

exports.clearNotificationsByPlayer = function (req, res) {
  Notification.update({
    'userId': req.body.userId,
    'cleared': { $ne: true }
  },{
    'cleared': true
  },{
    multi: true
  }).exec(function (err, notifications) {
    res.send(notifications);
  });
};