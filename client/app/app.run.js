(function () {
  'use strict';
  angular.module('app').run(appRun);

  function appRun($rootScope, $state, sidebarService) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'not authorized') {
        $state.go('login');
        $state.previous = toState;
      }
    });

    $rootScope.$on('$stateChangeStart', function () {
      sidebarService.setSidebarStatus(false);
    });
  }
})();