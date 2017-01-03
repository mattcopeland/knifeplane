(function () {
  'use strict';
  angular.module('app').run(appRun);

  function appRun($rootScope, $state, $document, sidebarService) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'not authorized') {
        $state.go('login');
        $state.previous = toState;
        $state.prevParams = toParams;
      }
    });

    $rootScope.$on('$stateChangeStart', function () {
      sidebarService.setSidebarStatus(false);
      // Scroll to the top on route changes
      $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
    });
  }
})();