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

exports.createChallenge = function (req, res) {
  var challengeData = req.body.challenge;
  var challenger = challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
  var opponent = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName;
  var challengeDetails = {
    competitionId: challengeData.competitionId,
    description: challenger + ' has challenged ' + opponent
  };
  
  Challenge.create(challengeData, function (err) {
    if (err) {
      console.log(err);
      res.status(400);
      return res.send({
        reason: err.toString()
      });
    }
    websockets.broadcast('challenge_created', challengeDetails);
    res.status(201);
  });
};

exports.completeChallenge = function (req, res, next) {
  var challengeData = req.body.challenge;
  var winner, loser, description;
  if (challengeData.forfeit) {
    description = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName + ' forfeited to ' +  challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
  } else {
    if (challengeData.challenger.winner) {
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
    description: description
  };

  Challenge.findOneAndUpdate({
    '_id': challengeData._id
  }, {
    'complete': true,
    'forfeit': challengeData.challenger.forfeit,
    'challenger.winner': challengeData.challenger.winner || false,
    'opponent.winner': challengeData.opponent.winner || false,
    'completed': Date.now()
  }).exec(function (err, challenge) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('challenge_completed', challengeDetails);
    res.status(201).json(challenge);
  });
};