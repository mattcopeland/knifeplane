(function () {
  'use strict';
  angular.module('app').factory('userService', userService);

  function userService($http) {
    var service = {
      getAllUsers: getAllUsers,
      verifyUser: verifyUser
    };
    return service;

    function getAllUsers() {
      return $http.get('/api/users').then(function (users) {
        return users;
      });
    }

    function verifyUser(userId, verificationToken) {
      return $http.get('/api/user/verification', {
        params: {
          userId: userId,
          verificationToken: verificationToken
        }
      });  
    }
  }
})();