(function () {
  'use strict';
  angular.module('app').run(appRun);

  function appRun($rootScope, $state, userService, Notification) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'not authorized') {
        $state.go('login');
      }
    });
  }
})();