(function () {
  'use strict';
  angular.module('app').controller('RegisterCtrl', RegisterCtrl);

  function RegisterCtrl($scope, $state, authService) {
    var vm = this;
    vm.register = register;

    activate();

    function activate() {}

    function register(newUser) {
      authService.createUser(newUser).then(function (response) {
        $state.go('home');
      });
    }
  }
})();