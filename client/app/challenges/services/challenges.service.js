(function () {
  'use strict';
  angular
    .module('app')
    .factory('challengesService', challengesService);

  function challengesService($http) {
    var service = {
      createChallenge: createChallenge,
      completeChallenge: completeChallenge,
      getChallengesByCompetition: getChallengesByCompetition,
      getActiveChallengesByCompetition: getActiveChallengesByCompetition,
      getActiveChallengeByCompetitionByPlayer: getActiveChallengeByCompetitionByPlayer,
      getCompletedChallengesByCompetition: getCompletedChallengesByCompetition,
      deleteActiveChallengeByCompetitionByPlayer: deleteActiveChallengeByCompetitionByPlayer,
      deleteChallenge: deleteChallenge,
      getPlayerResultsByCompetition: getPlayerResultsByCompetition
    };

    return service;

    function createChallenge(challenge) {
      return $http.post('/api/challenges/create', {
        challenge: challenge
      });
    }

    function completeChallenge(challenge) {
      return $http.post('/api/challenges/complete',  {
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

    function deleteChallenge(challengeId) {
      return $http.delete('/api/challenges/delete',  {
        params: {
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