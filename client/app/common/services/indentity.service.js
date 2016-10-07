(function () {
  'use strict';
  angular.module('app').factory('identityService', identityService);

  function identityService($window) {
    var currentUser;
    if ($window.bootstrappedUserObject !== null) {
      currentUser = $window.bootstrappedUserObject;
    }
    var service = {
      currentUser: currentUser,
      isAuthenticated: isAuthenticated,
      isAuthorized: isAuthorized
    };
    return service;

    function isAuthenticated() {
      return !!this.currentUser;
    }

    function isAuthorized(role) {
      return !!this.currentUser && this.currentUser.roles.indexOf(role) > -1;
    }
  }
})();