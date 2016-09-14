var Challenge = require('mongoose').model('Challenge');
var websockets = require('../websockets');

exports.getByCompetition = function (req, res) {
  var competitionId = req.query.competitionId;
  Challenge.find({
    competitionId: competitionId
  }).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.createChallenge = function (req, res) {
  var challengeData = req.body.challenge;
  var challenger = challengeData.challenger.firstName + ' ' + challengeData.challenger.lastName;
  var opponent = challengeData.opponent.firstName + ' ' + challengeData.opponent.lastName;
  var challengeDetails = challenger + ' has challenged ' + opponent;
  
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