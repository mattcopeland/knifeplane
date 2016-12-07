(function () {
  'use strict';
  angular.module('app').controller('PasswordResetCtrl', PasswordResetCtrl);

  function PasswordResetCtrl($state, $stateParams, userService, notifyService, authService, identityService) {
    var vm = this;
    vm.username = '';
    vm.verified = false;
    vm.resetPasswordForm = {};
    vm.generatePasswordResetLink = generatePasswordResetLink;
    vm.resetPassword = resetPassword;

    activate();

    function activate() {
      if (identityService.isAuthenticated()) {
        $state.go('home');
      } else if ($stateParams.userId && $stateParams.verificationToken) {
        userService.verifyUser($stateParams.userId, $stateParams.verificationToken).then(function (response) {
          if (response.data) {
            vm.verified = true;
          }
        });
      }
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

    function resetPassword(resetPasswordForm) {
      if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
        notifyService.error('Passwords don\'t match!');
      } else {
        userService.resetPassword($stateParams.userId, $stateParams.verificationToken, resetPasswordForm.password).then(function (response) {
          if (response.data) {
            authService.authenticateUser(response.data.username, resetPasswordForm.password).then(function (response) {
              $state.go('home');
            });
          }
        });
      }
    }
  }
})();