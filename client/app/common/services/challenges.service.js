(function () {
  'use strict';
  angular.module('app').factory('challengesService', challengesService);

  function challengesService($http) {
    var service = {
      create: create,
      getByCompetition: getByCompetition
    };

    return service;

    function create(challenge) {
      return $http.post('/api/challenges/create', {
        challenge: challenge
      });
    }

    function getByCompetition(competitionId) {
      return $http.get('/api/challenges/competition',  {
        params: {
          competitionId: competitionId
        }
      });
    }
  }
})();