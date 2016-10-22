(function () {
  'use strict';
  angular.module('app').controller('RegisterCtrl', RegisterCtrl);

  function RegisterCtrl($scope, $state, authService, notifyService) {
    var vm = this;
    vm.register = register;

    activate();

    function activate() {}

    function register(newUser) {
      if (newUser.password !== newUser.confirmPassword) {
        notifyService.error('Passwords don\'t match!');
      } else {
        authService.createUser(newUser).then(function () {
          $state.go('home');
        });
      }
    }
  }
})();