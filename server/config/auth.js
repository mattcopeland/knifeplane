var passport = require('passport');

exports.authenticate = function (req, res, next) {
  req.body.username = req.body.username.toLowerCase();
  var auth = passport.authenticate('local', function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.send({
        success: false
      });
    }
    if (user === 'unverified') {
      user = null;
      res.send({
        success: false,
        message: 'unverified'
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        next(err);
      }
      res.send({
        success: true,
        user: user
      });
    });
  });
  auth(req, res, next);
};

exports.requiresApiLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(403);
    res.end();
  } else {
    next();
  }
};

exports.requiresRole = function (role) {
  return function (req, res, next) {
    if (!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
      res.status(403);
      res.end();
    } else {
      next();
    }
  };
};