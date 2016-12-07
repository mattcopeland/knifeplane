(function () {
  'use strict';
  angular.module('app').controller('PasswordResetCtrl', PasswordResetCtrl);

  function PasswordResetCtrl($state, userService, notifyService) {
    var vm = this;
    vm.username = '';
    vm.generatePasswordResetLink = generatePasswordResetLink;

    activate();

    function activate() {
      
    }

    function generatePasswordResetLink(username) {
      userService.generatePasswordResetLink(username).then(function (response) {
        if (!response.data) {
          notifyService.error('Could not find that email address');
        } else {
          notifyService.success('Please check your email for a password reset link');
          $state.go('home');
        }
      });
    }
  }
})();