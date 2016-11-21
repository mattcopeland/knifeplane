var Challenge = require('mongoose').model('Challenge');
var websockets = require('../websockets');

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


exports.createChallenge = function (req, res) {
  var challengeData = req.body.challenge;
  var challenger = challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
  var opponent = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName;
  var challengeDetails = {
    competitionId: challengeData.competitionId,
    description: challenger + ' has challenged ' + opponent
  };
  
  Challenge.create(challengeData, function (err, challenge) {
    if (err) {
      console.log(err);
      res.status(400);
      return res.send({
        reason: err.toString()
      });
    }
    websockets.broadcast('challenge_created', challengeDetails);
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
    websockets.broadcast('challenge_completed', challengeDetails);
    res.status(201).json(challenge);
  });
};