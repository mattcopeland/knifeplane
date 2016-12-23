var auth = require('./auth'),
  users = require('../controllers/users'),
  competitions = require('../controllers/competitions'),
  challenges = require('../controllers/challenges'),
  alerts = require('../controllers/alerts');
  
module.exports = function (app) {
  app.get('/api/users', auth.requiresApiLogin, users.getUsers);
  app.post('/api/users', users.createUser);
  app.put('/api/user', auth.requiresApiLogin, users.updateUser);
  app.get('/api/user/verification', users.verifyUser);
  app.get('/api/user/password/link', users.generatePasswordResetLink);
  app.put('/api/user/password/reset', users.resetPassword);

  app.get('/api/competition', competitions.getCompetition);
  app.get('/api/competitions', competitions.getCompetitions);
  app.get('/api/competitions/user', auth.requiresApiLogin, competitions.getCompetitionsForUser);
  app.post('/api/competitions/create', auth.requiresApiLogin, competitions.createCompetition);
  app.post('/api/competitions/update', auth.requiresApiLogin, competitions.updateCompetition);
  app.delete('/api/competitions/delete', auth.requiresApiLogin, competitions.deleteCompetition);
  app.post('/api/competitions/swapPositions', competitions.swapPositions);
  app.post('/api/competitions/addPlayer', auth.requiresApiLogin, competitions.addPlayer);
  app.post('/api/competitions/addPlayerRequest', auth.requiresApiLogin, competitions.addPlayerRequest);
  app.post('/api/competitions/removePlayer', auth.requiresApiLogin, competitions.removePlayer);
  app.post('/api/competitions/approvePlayer', auth.requiresApiLogin, competitions.approvePlayer);
  app.post('/api/competitions/denyPlayer', auth.requiresApiLogin, competitions.denyPlayer);

  app.get('/api/challenges/competition', challenges.getChallengesByCompetition);
  app.get('/api/challenges/active/competition', challenges.getActiveChallengesByCompetition);
  app.get('/api/challenges/active/competition/player', challenges.getActiveChallengeByCompetitionByPlayer);
  app.get('/api/challenges/completed/competition', challenges.getCompletedChallengesByCompetition);
  app.get('/api/challenges/results/competition/player', challenges.getPlayerResultsByCompetition);
  app.delete('/api/challenges/active/competition/player/delete', auth.requiresApiLogin, challenges.deleteActiveChallengeByCompetitionByPlayer);
  app.delete('/api/challenges/delete', auth.requiresApiLogin, challenges.deleteChallenge);
  app.post('/api/challenges/pyramid/create', auth.requiresApiLogin, challenges.createPyramidChallenge);
  app.post('/api/challenges/versus/create', auth.requiresApiLogin, challenges.createVersusChallenge);
  app.post('/api/challenges/pyramid/complete', challenges.completePyramidChallenge);
  app.post('/api/challenges/versus/complete', challenges.completeVersusChallenge);

  app.get('/api/alerts/', auth.requiresApiLogin, alerts.getActiveAlertsByPlayer);
  app.put('/api/alert/clear', auth.requiresApiLogin, alerts.clearAlert);
  app.put('/api/alerts/clear', auth.requiresApiLogin, alerts.clearAlertsByPlayer);

  app.post('/login', auth.authenticate);

  app.post('/logout', function (req, res) {
    req.logout();
    res.end();
  });

  app.all('/api/*', function (req, res) {
    res.sendStatus(404);
  });

  app.get('*', function (req, res) {
    res.render('index', {
      bootstrappedUser: req.user
    });
  });
};