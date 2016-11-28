var auth = require('./auth'),
  users = require('../controllers/users'),
  pyramids = require('../controllers/pyramids'),
  challenges = require('../controllers/challenges');
  
module.exports = function (app) {
  app.get('/api/users', auth.requiresApiLogin, users.getUsers);
  app.post('/api/users', users.createUser);
  app.put('/api/users', auth.requiresApiLogin, users.updateUser);
  app.get('/api/user/verification', users.verifyUser);

  app.get('/api/pyramid', pyramids.getPyramid);
  app.get('/api/pyramids', pyramids.getPyramids);
  app.get('/api/pyramids/user', auth.requiresApiLogin, pyramids.getPyramidsForUser);
  app.post('/api/pyramids/create', auth.requiresApiLogin, pyramids.createPyramid);
  app.post('/api/pyramids/swapPositions', pyramids.swapPositions);
  app.post('/api/pyramids/addPlayer', auth.requiresApiLogin, pyramids.addPlayer);
  app.post('/api/pyramids/addPlayerRequest', auth.requiresApiLogin, pyramids.addPlayerRequest);
  app.post('/api/pyramids/removePlayer', auth.requiresApiLogin, pyramids.removePlayer);
  app.post('/api/pyramids/approvePlayer', auth.requiresApiLogin, pyramids.approvePlayer);
  app.post('/api/pyramids/denyPlayer', auth.requiresApiLogin, pyramids.denyPlayer);

  app.get('/api/challenges/competition', challenges.getChallengesByCompetition);
  app.get('/api/challenges/active/competition', challenges.getActiveChallengesByCompetition);
  app.get('/api/challenges/active/competition/player', challenges.getActiveChallengeByCompetitionByPlayer);
  app.get('/api/challenges/completed/competition', challenges.getCompletedChallengesByCompetition);
  app.get('/api/challenges/results/competition/player', challenges.getPlayerResultsByCompetition);
  app.post('/api/challenges/create', auth.requiresApiLogin, challenges.createChallenge);
  app.post('/api/challenges/complete', challenges.completeChallenge);

  app.post('/login', auth.authenticate);

  app.post('/logout', function (req, res) {
    req.logout();
    res.end();
  });

  app.all('/api/*', function (req, res) {
    res.send(404);
  });

  app.get('*', function (req, res) {
    res.render('index', {
      bootstrappedUser: req.user
    });
  });
};