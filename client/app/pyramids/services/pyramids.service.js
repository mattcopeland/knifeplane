(function () {
  'use strict';
  angular.module('app').factory('pyramidsService', pyramidsService);

  function pyramidsService($http) {
    var service = {
      getPyramid: getPyramid,
      getPyramidsForUser: getPyramidsForUser,
      createPyramid: createPyramid,
      swapPositions: swapPositions,
      addPlayerToPyramid: addPlayerToPyramid
    };

    return service;

    /**
     * Gets a pyramid from the database (or memory)
     *
     * @param {number} pyramid id for the requested pyramid
     * @return {Object} pyramid
     */
    function getPyramid(pyramidId) {
      return $http.get('/api/pyramid', {
        params: {
          pyramidId: pyramidId
        }
      });
    }

    /**
     * Gets all pyramids from the database the a particular user is included in
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

    function createPyramid(pyramid) {
      return $http.post('/api/pyramids/create', {
        pyramid: pyramid
      });
    }

    function swapPositions(pyramidId, player1, player2) {
      return $http.post('/api/pyramids/swapPositions', {
        pyramidId: pyramidId,
        player1: player1,
        player2: player2
      });
    }

    function addPlayerToPyramid(pyramidId, player) {
      return $http.post('/api/pyramids/addPlayer', {
        pyramidId: pyramidId,
        player: player
      });
    }
  }
})();