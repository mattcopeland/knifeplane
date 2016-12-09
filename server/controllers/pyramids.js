var Pyramid = require('mongoose').model('Pyramid');
var websockets = require('../websockets');
var emails = require('./emails');

exports.getPyramid = function (req, res) {
  Pyramid.findOne({
    _id: req.query.competitionId
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

exports.createPyramid = function (req, res) {
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

exports.updatePyramid = function (req, res, next) {
  var pyramidData = req.body.pyramid;
  var details = {
    competitionId: pyramidData._id,
    description: pyramidData.name + ' has been updated by the owner.'
  };
  Pyramid.findOneAndUpdate(
    {
      _id: pyramidData._id
    }, {
      $set: {
        'name': pyramidData.name,
        'forfeitDays': pyramidData.forfeitDays,
        'open': pyramidData.open,
        'players': pyramidData.players,
        'pendingPlayers': pyramidData.pendingPlayers,
        'owners': pyramidData.owners
      }
    })
    .exec(function (err, pyramid) {
      if (err) {
        return next(err);
      }
      websockets.broadcast('pyramid_updated', details);
      res.status(201).json(pyramid);
    });
};

exports.deletePyramid = function (req, res) {
  var challengeDetails = {
    competitionId: req.query.competitionId
  };
  Pyramid.findOneAndRemove({
    _id: req.query.competitionId
  }).exec(function () {
    websockets.broadcast('pyramid_deleted', challengeDetails);
    res.send('deleted');
  });
};


exports.swapPositions = function (req, res, next) {
  Pyramid.findOneAndUpdate(
    {
      _id: req.body.competitionId,
      'players._id': req.body.challenger._id
    }, {
      $set: {
        'players.$.position': req.body.opponent.position
      }
    })
    .exec(function (err) {
      if (err) {
        return next(err);
      }
    });

  Pyramid.findOneAndUpdate(
    {
      _id: req.body.competitionId,
      'players._id': req.body.opponent._id
    }, {
      $set: {
        'players.$.position': req.body.challenger.position
      }
    })
    .exec(function (err, pyramids) {
      if (err) {
        return next(err);
      }

      res.status(201).json(pyramids);
    });
};

exports.addPlayer = function (req, res, next) {
  var player = req.body.player.firstName + ' ' + req.body.player.lastName;
  var details = {
    competitionId: req.body.competitionId,
    description: player + ' has joined the competition'
  };
  Pyramid.findByIdAndUpdate({
    _id: req.body.competitionId
  }, {
    $push: {
      'players': req.body.player
    }
  })
  .exec(function (err, pyramid) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('player_added', details);
    res.status(201).json(pyramid);
  });
};

exports.addPlayerRequest = function (req, res, next) {
  emails.addPlayerRequest(req.body.competition, req.body.player, req.get('host'));
  var player = req.body.player.firstName + ' ' + req.body.player.lastName;
  var details =  {
    competitionId: req.body.competition._id,
    description: player + ' has requested to join the competition'
  };
  
  Pyramid.findByIdAndUpdate({
    _id: req.body.competition._id
  }, {
    $push: {
      'pendingPlayers': req.body.player
    }
  })
  .exec(function (err, pyramid) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('add_player_request', details);
    res.status(201).json(pyramid);
  });
};

exports.removePlayer = function (req, res, next) {
  var removedPlayer = req.body.removedPlayer;
  var details =  {
    competitionId: req.body.competitionId,
    description: removedPlayer.firstName + ' ' + removedPlayer.lastName + ' has left the competition'
  };
  Pyramid.findByIdAndUpdate({
    _id: req.body.competitionId
  }, {
    $set: {
      'players': req.body.players
    }
  })
  .exec(function (err, pyramid) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('player_removed', details);
    res.status(201).json(pyramid);
  });
};

exports.approvePlayer = function (req, res, next) {
  var player = req.body.player.firstName + ' ' + req.body.player.lastName;
  var details = {
    competitionId: req.body.competitionId,
    description: player + ' has joined the competition'
  };

  var competitionName;
  Pyramid.findOne({
    _id: req.body.competitionId
  }, 'name', function (err, pyramid) {
    if (err) {
      return next(err);  
    }
    competitionName = pyramid.name;
    emails.approveRequest(req.body.competitionId, competitionName, req.body.player, req.get('host'));
  });

  Pyramid.findByIdAndUpdate({
    _id: req.body.competitionId
  }, {
    $push: {
      'players': req.body.player
    },
    $pull: {
      'pendingPlayers': {
        '_id': req.body.player._id
      }
    }
  })
  .exec(function (err, pyramid) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('player_added', details);
    res.status(201).json(pyramid);
  });
};

exports.denyPlayer = function (req, res, next) {
  var player = req.body.player.firstName + ' ' + req.body.player.lastName;
  var details = {
    competitionId: req.body.competitionId,
    description: player + ' has been denied entry to the competition'
  };
  var competitionName;
  Pyramid.findOne({
    _id: req.body.competitionId
  }, 'name', function (err, pyramid) {
    if (err) {
      return next(err);  
    }
    competitionName = pyramid.name;
    emails.denyRequest(req.body.competitionId, competitionName, req.body.player, req.get('host'));
  });

  Pyramid.findByIdAndUpdate({
    _id: req.body.competitionId
  }, {
    $pull: {
      'pendingPlayers': {
        '_id': req.body.player._id
      }
    }
  })
  .exec(function (err, pyramid) {
    if (err) {
      return next(err);
    }
    websockets.broadcast('add_player_request_denied', details);
    res.status(201).json(pyramid);
  });
};