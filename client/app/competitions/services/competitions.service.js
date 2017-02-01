(function () {
  'use strict';
  angular.module('app').factory('competitionsService', competitionsService);

  function competitionsService($http) {
    var service = {
      getCompetition: getCompetition,
      getCompetitionsForUser: getCompetitionsForUser,
      getPublicCompetitions: getPublicCompetitions,
      getPrivateCompetitions: getPrivateCompetitions,
      createCompetition: createCompetition,
      updateCompetition: updateCompetition,
      deleteCompetition: deleteCompetition,
      createWaitingPeriod: createWaitingPeriod,
      swapPositions: swapPositions,
      addPlayerToCompetition: addPlayerToCompetition,
      addPlayerToCompetitionRequest: addPlayerToCompetitionRequest,
      removedPlayerFromCompetition: removedPlayerFromCompetition,
      approvePendingPlayer: approvePendingPlayer,
      denyPendingPlayer: denyPendingPlayer,
      putPlayerOnHold: putPlayerOnHold,
      cancelPlayerHold: cancelPlayerHold
    };

    return service;

    /**
     * Gets a competition from the database (or memory)
     *
     * @param {number} competition id for the requested competition
     * @return {Object} competition
     */
    function getCompetition(competitionId) {
      return $http.get('/api/competition', {
        params: {
          competitionId: competitionId
        }
      });
    }

    /**
     * Gets all competitions from the database that a particular user is included in
     *
     * @param {userId} the user id for the requested user
     * @return {Object} competitions
     */
    function getCompetitionsForUser(userId) {
      return $http.get('/api/competitions/user', {
        params: {
          userId: userId
        }
      });
    }

    /**
     * Gets all active public competitions from the database
     *
     * @return {Object} competitions
     */
    function getPublicCompetitions() {
      return $http.get('/api/competitions/public');
    }

    /**
     * Gets all private competitions from the database
     *
     * @return {Object} competitions
     */
    function getPrivateCompetitions() {
      return $http.get('/api/competitions/private');
    }

    function createCompetition(competition) {
      return $http.post('/api/competitions/create', {
        competition: competition
      });
    }

    function updateCompetition(competition) {
      return $http.post('/api/competitions/update', {
        competition: competition
      });
    }

    function deleteCompetition(competitionId) {
      return $http.delete('/api/competitions/delete',  {
        params: {
          competitionId: competitionId
        }
      });
    }

    function createWaitingPeriod(competitionId, loserId, winnerId, waitingPeriod) {
      return $http.put('/api/competitions/createWaitingPeriod',  {
        competitionId: competitionId,
        loserId: loserId,
        winnerId: winnerId,
        waitingPeriod: waitingPeriod
      });
    }

    function swapPositions(competitionId, challenger, opponent) {
      return $http.post('/api/competitions/swapPositions', {
        competitionId: competitionId,
        challenger: challenger,
        opponent: opponent
      });
    }

    function addPlayerToCompetition(competitionId, player) {
      return $http.post('/api/competitions/addPlayer', {
        competitionId: competitionId,
        player: player
      });
    }

    function addPlayerToCompetitionRequest(competition, player) {
      return $http.post('/api/competitions/addPlayerRequest', {
        competition: competition,
        player: player
      });
    }

    function removedPlayerFromCompetition(competitionId, removedPlayer, players) {
      return $http.post('/api/competitions/removePlayer', {
        competitionId: competitionId,
        removedPlayer: removedPlayer,
        players: players
      });
    }

    function approvePendingPlayer(competitionId, player) {
      return $http.post('/api/competitions/approvePlayer', {
        competitionId: competitionId,
        player: player
      });
    }

    function denyPendingPlayer(competitionId, player) {
      return $http.post('/api/competitions/denyPlayer', {
        competitionId: competitionId,
        player: player
      });
    }

    function putPlayerOnHold(competitionId, player) {
      return $http.put('/api/competitions/playerHold', {
        competitionId: competitionId,
        player: player
      });
    }

    function cancelPlayerHold(competitionId, playerId, displayName, challenged) {
      return $http.delete('/api/competitions/playerHold', {
        params: {
          competitionId: competitionId,
          playerId: playerId,
          displayName: displayName,
          challenged: challenged
        }
      });
    }
  }
})();