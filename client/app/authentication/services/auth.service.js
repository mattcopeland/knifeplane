(function () {
  'use strict';
  angular.module('app').factory('authService', authService);

  function authService($state, $http, $q, userService, identityService) {
    var service = {
      authenticateUser: authenticateUser,
      createUser: createUser,
      logout: logout,
      authorizeCurrentUserForRoute: authorizeCurrentUserForRoute,
      authenticatedUserForRoute: authenticatedUserForRoute
    };
    return service;

    function authenticateUser(username, password) {
      var dfd = $q.defer();
      $http.post('/login', {
        username: username,
        password: password
      }).then(function (response) {
        if (response.data.success) {
          identityService.currentUser = response.data.user;
          dfd.resolve(true);
        } else {
          dfd.resolve(false);
        }
      });
      return dfd.promise;
    }

    function createUser(userData) {
      var dfd = $q.defer();
      $http.post('/api/users', {
        userData: userData
      }).then(function (response) {
        if (response.data) {
          authenticateUser(userData.username, userData.password);
          dfd.resolve(true);
        } else {
          dfd.resolve(false);
        }
      });
      return dfd.promise;
    }

    function logout() {
      var dfd = $q.defer();
      $http.post('/logout', {
        logout: true
      }).then(function () {
        identityService.currentUser = undefined;
        dfd.resolve();
        $state.go('home');
      });
      return dfd.promise;
    }

    function authorizeCurrentUserForRoute(role) {
      if (identityService.isAuthorized(role)) {
        return true;
      } else {
        return $q.reject('not authorized');
      }
    }

    function authenticatedUserForRoute() {
      if (identityService.isAuthenticated()) {
        return true;
      } else {
        return $q.reject('not authorized');
      }
    }
  }
})();