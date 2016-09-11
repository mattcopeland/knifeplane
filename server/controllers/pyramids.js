var Pyramid = require('mongoose').model('Pyramid');
var websockets = require('../websockets');

exports.getPyramid = function (req, res) {
  Pyramid.findOne({
    _id: req.query.pyramidId
  }).exec(function (err, pyramid) {
    res.send(pyramid);
  });
};

exports.getPyramids = function (req, res) {
  Pyramid.find({}).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.getPyramidsForUser = function (req, res) {
  var userId = req.query.userId;
  Pyramid.find({
    players: {
      $elemMatch: {
        _id: userId
      }
    }
  }).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.createPyramid = function (req, res, next) {
  var pyramidData = req.body.pyramid;
  Pyramid.create(pyramidData, function (err, pyramid) {
    if (err) {
      res.status(400);
      return res.send({
        reason: err.toString()
      });
    }
    res.send(pyramid);
  });
};

exports.swapPositions = function (req, res, next) {
  var player1 = req.body.player1;
  var player2 = req.body.player2;
  var winner, loser;

  if (player1.position < player2.position) {
    winner = player1;
    loser = player2;
  } else {
    winner = player2;
    loser = player1;
  }

  var newResult = winner.firstName + ' ' + winner.lastName + ' beat ' + loser.firstName + ' ' + loser.lastName;

  Pyramid.update({
      _id: req.body.pyramidId,
      'players._id': req.body.player1._id
    }, {
      $set: {
        'players.$.position': req.body.player1.position
      }
    })
    .exec(function (err, pyramids) {
      if (err) {
        return next(err);
      }
    });

  Pyramid.update({
      _id: req.body.pyramidId,
      'players._id': req.body.player2._id
    }, {
      $set: {
        'players.$.position': req.body.player2.position
      }
    })
    .exec(function (err, pyramids) {
      if (err) {
        return next(err);
      }

      websockets.broadcast('match_results', newResult);
      res.status(201).json(pyramids);
    });
};

exports.addPlayer = function (req, res, next) {
  Pyramid.update({
      _id: req.body.pyramidId
    }, {
      $push: {
        'players': req.body.player
      }
    })
    .exec(function (err, pyramids) {
      if (err) {
        return next(err);
      }
      res.status(201).json(pyramids);
    });
};