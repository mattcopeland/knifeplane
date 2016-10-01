var Pyramid = require('mongoose').model('Pyramid');

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

exports.swapPositions = function (req, res, next) {
  Pyramid.update(
    {
      _id: req.body.pyramidId,
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

  Pyramid.update(
    {
      _id: req.body.pyramidId,
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