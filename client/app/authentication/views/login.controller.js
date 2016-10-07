(function () {
  'use strict';
  angular.module('app').controller('LoginCtrl', LoginCtrl);

  function LoginCtrl($state, authService, notifyService) {
    var vm = this;
    vm.login = login;

    activate();

    function activate() {
      console.log($state.previous);
    }

    function login(username, password) {
      authService.authenticateUser(username, password).then(function (response) {
        if (!response) {
          notifyService.error('Username / password combinaiton incorrect');
        } else {
          notifyService.success('Login successful.  Welcome to Knifeplane!');
          if ($state.previous) {
            $state.go($state.previous);
          } else {
            $state.go('home');
          }
        }
      });
    }
  }
})();