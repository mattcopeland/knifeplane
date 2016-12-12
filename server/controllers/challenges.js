var Challenge = require('mongoose').model('Challenge');
var websockets = require('../websockets');
var emails = require('./emails');
var alerts = require('./alerts');

exports.getChallengesByCompetition = function (req, res) {
  var competitionId = req.query.competitionId;
  Challenge.find({
    competitionId: competitionId
  }).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.getActiveChallengesByCompetition = function (req, res) {
  var competitionId = req.query.competitionId;
  Challenge.find({
    competitionId: competitionId,
    complete: {$ne: true}
  }).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.getActiveChallengeByCompetitionByPlayer = function (req, res) {
  var competitionId = req.query.competitionId;
  var playerId = req.query.playerId;
  Challenge.findOne({
    'competitionId': competitionId,
    'complete': { $ne: true },
    '$or': [
      {
        'challenger._id': playerId
      },{
        'opponent._id': playerId
      }
    ]
  }).exec(function (err, challenge) {
    res.send(challenge);
  });
};

exports.getCompletedChallengesByCompetition = function (req, res) {
  var competitionId = req.query.competitionId;
  var limit = parseInt(req.query.limit) || 0;
  Challenge.find({
    competitionId: competitionId,
    complete: {$eq: true}
  }).sort({
    'completed': -1
  }).limit(limit).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.deleteActiveChallengeByCompetitionByPlayer = function (req, res) {
  Challenge.findOneAndRemove({
    competitionId: req.query.competitionId,
    complete: false,
    '$or': [
      {
        'challenger._id': req.query.playerId
      },{
        'opponent._id': req.query.playerId
      }
    ]
  }).exec(function () {
    res.send('deleted');
  });
};

exports.deleteChallenge = function (req, res) {
  var challengeDetails = {
    competitionId: req.query.competitionId,
    description: 'A challenege was deleted by the owner'
  };
  Challenge.findOneAndRemove({
    _id: req.query.challengeId
  }).exec(function () {
    websockets.broadcast('pyramid_updated', challengeDetails);
    res.send('deleted');
  });
};

exports.getPlayerResultsByCompetition = function (req, res) {
  var competitionId = req.query.competitionId;
  var playerId = req.query.playerId;
  Challenge.find({
    competitionId: competitionId,
    complete: {$eq: true},
    '$or': [
      {
        'challenger._id': playerId
      },{
        'opponent._id': playerId
      }
    ]
  }).sort({
    'completed': -1
  }).exec(function (err, collection) {
    res.send(collection);
  });
};

// Create a new challenge
exports.createChallenge = function (req, res) {
  var challengeData = req.body.challenge;
  var challenger = challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
  var opponent = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName;
  var challengeDetails = {
    competitionId: challengeData.competitionId,
    description: challenger + ' has challenged ' + opponent
  };
  var alertDetails = {
    userId: challengeData.opponent._id,
    competitionId: challengeData.competitionId,
    details: {
      state: 'pyramids.view',
      stateParams: {'competitionId': challengeData.competitionId},
      title: 'New Challenge',
      description: challenger + ' has challenged you'
    }
  };
  emails.challengeNotification(challengeData, req.get('host'));
  alerts.createAlerts([alertDetails]);
  
  Challenge.create(challengeData, function (err, challenge) {
    if (err) {
      res.status(400);
      return res.send({
        reason: err.toString()
      });
    }
    websockets.broadcast('pyramid_updated', challengeDetails);
    res.status(201).json(challenge);
  }); 
};

exports.completeChallenge = function (req, res, next) {
  var challengeData = req.body.challenge;
  var winner, loser, description;
  if (challengeData.forfeit) {
    if (challengeData.winner === 'challenger') {
      description = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName + ' forfeited to ' +  challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
    } else {
      description = challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName + ' forfeited to ' +  challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName;
    }
  } else {
    if (challengeData.winner === 'challenger') {
      winner = challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
      loser = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName;
    } else {
      winner = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName;
      loser = challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
    }
    description = winner + ' just defeated ' + loser;
  }

  var challengeDetails = {
    competitionId: challengeData.competitionId,
    challengerId: challengeData.challenger._id,
    opponentId: challengeData.opponent._id,
    description: description
  };

  var alertDetails = {
    userId: challengeData.opponent._id,
    competitionId: challengeData.competitionId
  };

  alerts.clearAlertsOnCompletedChallenge([alertDetails]);

  Challenge.findOneAndUpdate({
    '_id': challengeData._id
  }, {
    'complete': true,
    'forfeit': challengeData.forfeit,
    'completed': Date.now(),
    'winner': challengeData.winner
  }).exec(function (err, challenge) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('pyramid_updated', challengeDetails);
    res.status(201).json(challenge);
  });
};