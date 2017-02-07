var User = require('mongoose').model('User'),
  Competition = require('mongoose').model('Competition'),
  Challenge = require('mongoose').model('Challenge'),
  encrypt = require('../utilities/encryption'),
  uuid = require('uuid'),
  emails = require('./emails');

exports.getUsers = function (req, res) {
  User.find({}, {hashedPwd: 0, salt: 0, verificationToken: 0}).sort({
    'firstName': 1 
  }).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.getUserInfo = function (req, res) {
  User.findOne({
    _id: req.query.userId
  }, {hashedPwd: 0, salt: 0, verificationToken: 0}).exec(function (err, user) {
    res.send(user);
  });
};

exports.getVerifiedUsers = function (req, res) {
  User.find({
    verified: { $eq: true }
  }, {hashedPwd: 0, salt: 0, verificationToken: 0}).sort({
    'firstName': 1 
  }).exec(function (err, collection) {
    res.send(collection);
  });
};

exports.createUser = function (req, res) {
  var userData = req.body.userData;
  userData.username = userData.username.toLowerCase();
  userData.salt = encrypt.createSalt();
  userData.hashedPwd = encrypt.hashPwd(userData.salt, userData.password);
  userData.verificationToken = uuid();
  User.create(userData, function (err, user) {
    if (err) {
      if (err.toString().indexOf('E11000') > -1) {
        err = new Error('Email already in use');
      }
      res.status(400);
      return res.send({
        reason: err.toString()
      });
    }
    emails.userVerification(user, req.get('host'));
    res.send(user);
  });
};

exports.verifyUser = function (req, res, next) {
  User.findOneAndUpdate({
    _id: req.query.userId,
    verificationToken: req.query.verificationToken
  }, {
    $set: {
      verified: true
    }
  })
  .select('_id')
  .exec(function (err, user) {
    if (err) {
      return next(err);
    }
    res.status(201).json(user);
  });
};

exports.generatePasswordResetLink = function (req, res) {
  var verificationToken = uuid();
  User.findOneAndUpdate({
    username: req.query.username
  }, {
    $set: {
      verificationToken: verificationToken
    }
  }, {
    new: true
  }).exec(function (err, user) {
    if (user) {
      emails.passwordReset(user, verificationToken, req.get('host'));
    }
    res.status(201).json(user);
  });
};

exports.resetPassword = function (req, res) {
  var user = {
    _id: req.body.userId
  };
  user.salt = encrypt.createSalt();
  user.hashedPwd = encrypt.hashPwd(user.salt, req.body.password);
  
  User.findOneAndUpdate({
    _id: req.body.userId,
    verificationToken: req.body.verificationToken
  }, user).exec(function (err, user) {
    if (user) {
      console.log('password reset successful');
    }
    res.status(201).json(user);
  });
};

exports.updateUser = function (req, res) {
  var userUpdates = req.body.user;

  if ((req.user._id.toString() !== userUpdates._id) && !req.user.hasRole('super-admin')) {
    res.status(403);
    return res.end();
  }

  if (userUpdates.password && userUpdates.password.length > 0) {
    userUpdates.salt = encrypt.createSalt();
    userUpdates.hashedPwd = encrypt.hashPwd(userUpdates.salt, userUpdates.password);
  }

  // Uppdate the user's name in competitions players
  if (userUpdates.displayName && userUpdates.displayName.length > 0) {
    Competition.update({
      'players._id': userUpdates._id
    }, {
      $set: {
        'players.$.firstName': userUpdates.firstName,
        'players.$.lastName': userUpdates.lastName,
        'players.$.displayName': userUpdates.displayName
      }
    },{
      multi: true
    }).exec();
  }

  // Uppdate the user's name in competitions admins
  if (userUpdates.displayName && userUpdates.displayName.length > 0) {
    Competition.update({
      'admins._id': userUpdates._id
    }, {
      $set: {
        'admins.$.firstName': userUpdates.firstName,
        'admins.$.lastName': userUpdates.lastName,
        'admins.$.displayName': userUpdates.displayName
      }
    },{
      multi: true
    }).exec();
  }

  // Uppdate the user's name in competitions pending players
  if (userUpdates.displayName && userUpdates.displayName.length > 0) {
    Competition.update({
      'pendingPlayers._id': userUpdates._id
    }, {
      $set: {
        'pendingPlayers.$.firstName': userUpdates.firstName,
        'pendingPlayers.$.lastName': userUpdates.lastName,
        'pendingPlayers.$.displayName': userUpdates.displayName
      }
    },{
      multi: true
    }).exec();
  }

  // Uppdate the user's name in challenges when they are the challenger
  if (userUpdates.displayName && userUpdates.displayName.length > 0) {
    Challenge.update({
      'challenger._id': userUpdates._id
    }, {
      $set: {
        'challenger.firstName': userUpdates.firstName,
        'challenger.lastName': userUpdates.lastName,
        'challenger.displayName': userUpdates.displayName
      }
    },{
      multi: true
    }).exec();
  }

  // Uppdate the user's name in challenges when they are the opponent
  if (userUpdates.displayName && userUpdates.displayName.length > 0) {
    Challenge.update({
      'opponent._id': userUpdates._id
    }, {
      $set: {
        'opponent.firstName': userUpdates.firstName,
        'opponent.lastName': userUpdates.lastName,
        'opponent.displayName': userUpdates.displayName
      }
    },{
      multi: true
    }).exec();
  }

  User.findByIdAndUpdate(userUpdates._id, userUpdates, function (err, user) {
    if (err) {
      res.status(400);
      return res.send({
        reason: err.toString()
      });
    }
    res.send(user);
  });
};