(function () {
  'use strict';
  angular.module('app').controller('LoginCtrl', LoginCtrl);

  function LoginCtrl($scope, $state, authService) {
    var vm = this;
    vm.login = login;

    activate();

    function activate() {}

    function login(username, password) {
      authService.authenticateUser(username, password).then(function (response) {
        $state.go('home');
      });
    }
  }
})();