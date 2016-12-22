(function () {
  'use strict';
  angular.module('app').controller('LoginCtrl', LoginCtrl);

  function LoginCtrl($state, authService, notifyService) {
    var vm = this;
    vm.login = login;

    activate();

    function activate() {
    }

    function login(username, password) {
      authService.authenticateUser(username, password).then(function (response) {
        if (!response) {
          notifyService.error('Username / password combinaiton incorrect');
        } else if (response === 'unverified') {
          notifyService.error('You must verify your email before you can login');
        } else {
          if ($state.previous) {
            $state.go($state.previous, $state.prevParams);
            $state.previous = null;
            $state.prevParams = null;
          } else {
            $state.go('competitions.myCompetitions');
          }
        }
      });
    }
  }
})();