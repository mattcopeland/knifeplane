var Challenge = require('mongoose').model('Challenge');
var Competition = require('mongoose').model('Competition');
var websockets = require('../websockets');
var emails = require('./emails');
var alerts = require('./alerts');
var _ = require('lodash');

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
    description: 'A challenege was deleted by an admin'
  };
  Challenge.findOneAndRemove({
    _id: req.query.challengeId
  }).exec(function () {
    websockets.broadcast('competition_updated', challengeDetails);
    res.send('deleted');
  });
};

exports.deleteAllActiveChallenges = function (req, res) {
  var challengeDetails = {
    competitionId: req.query.competitionId,
    description: 'All challeneges were cancelled'
  };
  Challenge.remove({
    competitionId: req.query.competitionId,
    complete: {$ne: true}
  }).exec(function () {
    websockets.broadcast('competition_updated', challengeDetails);
    res.send('deleted');
  });
};

// Create a new pyramid challenge
exports.createPyramidChallenge = function (req, res) {
  var challengeData = req.body.challenge;
  var challenger = challengeData.challenger.displayName;
  var opponent = challengeData.opponent.displayName;
  var challengeDetails = {
    competitionId: challengeData.competitionId,
    description: '<b>' + challenger + '</b> has challenged <b>' + opponent + '</b>'
  };
  var alertDetails = {
    userId: challengeData.opponent._id,
    competitionId: challengeData.competitionId,
    details: {
      state: 'competitions.view',
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
    websockets.broadcast('competition_updated', challengeDetails);
    res.status(201).json(challenge);
  }); 
};

// Create a new versus challenge
exports.createVersusChallenge = function (req, res) {
  var challengeData = req.body.challenge;
  var alertsArray = [];
  var challengeDetails = {
    competitionId: challengeData.competitionId,
    description: '<b>Team ' + challengeData.challenger.team + '</b> has challenged <b>Team ' +  challengeData.opponent.team + '</b>'
  };
  // Get the players in the competition to send alerts
  Competition.findOne({
    _id: challengeData.competitionId
  }, function (err, competition) {
    if (err) {
      console.log(err);
    }
    _.forEach(competition.players, function (player) {
      // Don't alert the person who made the challenge'
      if (player._id !== challengeData.challenger._id) {
        var description = challengeData.challenger.team === player.position ? 'Your team just issued a challenge' : 'You have been challenged';
        var alertDetails = {
          competitionId: challengeData.competitionId,
          userId: player._id,
          details: {
            state: 'competitions.view',
            stateParams: {'competitionId': challengeData.competitionId},
            title: 'New Challenge',
            description: description
          }
        };
        alertsArray.push(alertDetails);
      }
    });
    alerts.createAlerts(alertsArray);
  });
  
  Challenge.create(challengeData, function (err, challenge) {
    if (err) {
      res.status(400);
      return res.send({
        reason: err.toString()
      });
    }
    websockets.broadcast('competition_updated', challengeDetails);
    res.status(201).json(challenge);
  }); 
};

exports.completePyramidChallenge = function (req, res, next) {
  var challengeData = req.body.challenge;
  var winner, loser, description;
  if (challengeData.forfeit) {
    if (challengeData.winner === 'challenger') {
      description = challengeData.opponent.displayName + ' forfeited to ' +  challengeData.challenger.displayName;
    } else {
      description = challengeData.challenger.displayName + ' forfeited to ' +  challengeData.opponent.displaytName;
    }
  } else {
    if (challengeData.winner === 'challenger') {
      winner = challengeData.challenger.displayName;
      loser = challengeData.opponent.displayName;
    } else {
      winner = challengeData.opponent.displayName;
      loser = challengeData.challenger.displayName;
    }
    description = '<b>' + winner + '</b> just defeated <b>' + loser + '</b>';
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
    websockets.broadcast('competition_updated', challengeDetails);
    res.status(201).json(challenge);
  });
};

exports.cancelPyramidChallenge = function (req, res, next) {
  var challengeData = req.body.challenge;
  var description = '<b>' + challengeData.challenger.displayName + '</b> cancelled the challenge against <b>' + challengeData.opponent.displayName + '</b>';

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

  alerts.clearAlertsOnCancelledChallenge([alertDetails]);

  Challenge.findOneAndRemove({
    '_id': challengeData._id
  }).exec(function (err, challenge) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('competition_updated', challengeDetails);
    res.status(201).json(challenge);
  });
};

exports.completeVersusChallenge = function (req, res, next) {
  var challengeData = req.body.challenge;
  var alertsArray= [];
  var winner, loser, description;
  if (challengeData.forfeit) {
    description = 'Team ' + challengeData.opponent.team + ' forfeited to Team ' +  challengeData.challenger.team;
  } else {
    if (challengeData.winner === 'challenger') {
      winner = 'Team ' + challengeData.challenger.team;
      loser = 'Team ' + challengeData.opponent.team;
    } else {
      winner = 'Team ' + challengeData.opponent.team;
      loser = 'Team ' + challengeData.challenger.team;
    }
    description = '<b>' + winner + '</b> just defeated <b>' + loser + '</b>';
  }

  var challengeDetails = {
    competitionId: challengeData.competitionId,
    description: description
  };

  // Get the players in the competition to send alerts
  Competition.findOne({
    _id: challengeData.competitionId
  }, function (err, competition) {
    if (err) {
      console.log(err);
    }
    _.forEach(competition.players, function (player) {
      var alertDetails = {
        competitionId: competition._id,
        userId: player._id
      };
      alertsArray.push(alertDetails);
    });
    alerts.clearAlertsOnCompletedChallenge(alertsArray);
  });

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
    websockets.broadcast('competition_updated', challengeDetails);
    res.status(201).json(challenge);
  });
};