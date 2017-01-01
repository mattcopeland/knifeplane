(function () {
  'use strict';
  angular
    .module('app')
    .factory('challengesService', challengesService);

  function challengesService($http) {
    var service = {
      createPyramidChallenge: createPyramidChallenge,
      createVersusChallenge: createVersusChallenge,
      cancelPyramidChallenge: cancelPyramidChallenge,
      completePyramidChallenge: completePyramidChallenge,
      completeVersusChallenge: completeVersusChallenge,
      getChallengesByCompetition: getChallengesByCompetition,
      getActiveChallengesByCompetition: getActiveChallengesByCompetition,
      getActiveChallengeByCompetitionByPlayer: getActiveChallengeByCompetitionByPlayer,
      getCompletedChallengesByCompetition: getCompletedChallengesByCompetition,
      deleteActiveChallengeByCompetitionByPlayer: deleteActiveChallengeByCompetitionByPlayer,
      deleteChallenge: deleteChallenge,
      getPlayerResultsByCompetition: getPlayerResultsByCompetition
    };

    return service;

    function createPyramidChallenge(challenge) {
      return $http.post('/api/challenges/pyramid/create', {
        challenge: challenge
      });
    }

    function cancelPyramidChallenge(challenge) {
      return $http.put('/api/challenges/pyramid/cancel', {
        challenge: challenge
      });
    }

    function createVersusChallenge(challenge) {
      return $http.post('/api/challenges/versus/create', {
        challenge: challenge
      });
    }

    function completePyramidChallenge(challenge) {
      return $http.post('/api/challenges/pyramid/complete',  {
        challenge: challenge
      });
    }

    function completeVersusChallenge(challenge) {
      return $http.post('/api/challenges/versus/complete',  {
        challenge: challenge
      });
    }

    function getChallengesByCompetition(competitionId) {
      return $http.get('/api/challenges/competition',  {
        params: {
          competitionId: competitionId
        }
      });
    }

    function getActiveChallengesByCompetition(competitionId) {
      return $http.get('/api/challenges/active/competition',  {
        params: {
          competitionId: competitionId
        }
      });
    }

    function getActiveChallengeByCompetitionByPlayer(competitionId, playerId) {
      return $http.get('/api/challenges/active/competition/player',  {
        params: {
          competitionId: competitionId,
          playerId: playerId
        }
      });
    }

    function getCompletedChallengesByCompetition(competitionId, limit) {
      return $http.get('/api/challenges/completed/competition',  {
        params: {
          competitionId: competitionId,
          limit: limit
        }
      });
    }

    function deleteActiveChallengeByCompetitionByPlayer(competitionId, playerId) {
      return $http.delete('/api/challenges/active/competition/player/delete',  {
        params: {
          competitionId: competitionId,
          playerId: playerId
        }
      });
    }

    function deleteChallenge(competitionId, challengeId) {
      return $http.delete('/api/challenges/delete',  {
        params: {
          competitionId: competitionId,
          challengeId: challengeId
        }
      });
    }

    function getPlayerResultsByCompetition(competitionId, playerId) {
      return $http.get('/api/challenges/results/competition/player',  {
        params: {
          competitionId: competitionId,
          playerId: playerId
        }
      });
    }
  }
})();