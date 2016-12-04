(function () {
  'use strict';
  angular.module('app').factory('pyramidsService', pyramidsService);

  function pyramidsService($http) {
    var service = {
      getPyramid: getPyramid,
      getPyramidsForUser: getPyramidsForUser,
      getPyramids: getPyramids,
      createPyramid: createPyramid,
      updatePyramid: updatePyramid,
      swapPositions: swapPositions,
      addPlayerToPyramid: addPlayerToPyramid,
      addPlayerToPyramidRequest: addPlayerToPyramidRequest,
      removedPlayerFromPyramid: removedPlayerFromPyramid,
      approvePendingPlayer: approvePendingPlayer,
      denyPendingPlayer: denyPendingPlayer
    };

    return service;

    /**
     * Gets a pyramid from the database (or memory)
     *
     * @param {number} pyramid id for the requested pyramid
     * @return {Object} pyramid
     */
    function getPyramid(competitionId) {
      return $http.get('/api/pyramid', {
        params: {
          competitionId: competitionId
        }
      });
    }

    /**
     * Gets all pyramids from the database that a particular user is included in
     *
     * @param {userId} the user id for the requested user
     * @return {Object} pyramids
     */
    function getPyramidsForUser(userId) {
      return $http.get('/api/pyramids/user', {
        params: {
          userId: userId
        }
      });
    }

    /**
     * Gets all active pyramids from the database
     *
     * @return {Object} pyramids
     */
    function getPyramids() {
      return $http.get('/api/pyramids');
    }

    function createPyramid(pyramid) {
      return $http.post('/api/pyramids/create', {
        pyramid: pyramid
      });
    }

    function updatePyramid(pyramid) {
      return $http.post('/api/pyramids/update', {
        pyramid: pyramid
      });
    }

    function swapPositions(competitionId, challenger, opponent) {
      return $http.post('/api/pyramids/swapPositions', {
        competitionId: competitionId,
        challenger: challenger,
        opponent: opponent
      });
    }

    function addPlayerToPyramid(competitionId, player) {
      return $http.post('/api/pyramids/addPlayer', {
        competitionId: competitionId,
        player: player
      });
    }

    function addPlayerToPyramidRequest(competition, player) {
      return $http.post('/api/pyramids/addPlayerRequest', {
        competition: competition,
        player: player
      });
    }

    function removedPlayerFromPyramid(competitionId, removedPlayer, players) {
      return $http.post('/api/pyramids/removePlayer', {
        competitionId: competitionId,
        removedPlayer: removedPlayer,
        players: players
      });
    }

    function approvePendingPlayer(competitionId, player) {
      return $http.post('/api/pyramids/approvePlayer', {
        competitionId: competitionId,
        player: player
      });
    }

    function denyPendingPlayer(competitionId, player) {
      return $http.post('/api/pyramids/denyPlayer', {
        competitionId: competitionId,
        player: player
      });
    }
  }
})();