(function () {
  'use strict';
  angular.module('app').factory('userService', userService);

  function userService($http, identityService) {
    var service = {
      getAllUsers: getAllUsers
    };
    return service;

    function getAllUsers() {
      return $http.get('/api/users').then(function (users) {
        return users;
      });
    }
  }
})();