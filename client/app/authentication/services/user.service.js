(function () {
  'use strict';
  angular.module('app').factory('userService', userService);

  function userService($http) {
    var service = {
      getAllUsers: getAllUsers,
      verifyUser: verifyUser,
      generatePasswordResetLink: generatePasswordResetLink,
      resetPassword: resetPassword
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

    function generatePasswordResetLink(username) {
      return $http.get('/api/user/password/link', {
        params: {
          username: username
        }
      });  
    }

    function resetPassword(userId, verificationToken, password) {
      return $http.put('/api/user/password/reset', {
        userId: userId,
        verificationToken: verificationToken,
        password: password
      });  
    }
  }
})();