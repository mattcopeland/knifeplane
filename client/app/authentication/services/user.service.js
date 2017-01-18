(function () {
  'use strict';
  angular.module('app').factory('userService', userService);

  function userService($http) {
    var service = {
      getAllUsers: getAllUsers,
      getVerifiedUsers: getVerifiedUsers,
      verifyUser: verifyUser,
      generatePasswordResetLink: generatePasswordResetLink,
      resetPassword: resetPassword,
      updateUser: updateUser
    };
    return service;

    function getAllUsers() {
      return $http.get('/api/users').then(function (users) {
        return users;
      });
    }

    function getVerifiedUsers() {
      return $http.get('/api/users/verified').then(function (users) {
        // Make sure every user has a display name
        _.forEach(users.data, function (user) {
          if (!user.displayName) {
            user.displayName = user.firstName + ' ' + user.lastName;
          }
        });
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

    function updateUser(user) {
      return $http.put('/api/user', {
        user: user
      });
    }
  }
})();