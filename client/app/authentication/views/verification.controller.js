(function () {
  'use strict';
  angular.module('app').controller('VerificationCtrl', VerificationCtrl);

  function VerificationCtrl($state, $stateParams, userService) {
    var vm = this;
    vm.verified = undefined;
    vm.verifying = false;

    activate();

    function activate() {
      if ($stateParams.userId && $stateParams.verificationToken) {
        vm.verifying = true;
        vm.verified = null;
        userService.verifyUser($stateParams.userId, $stateParams.verificationToken).then(function (response) {
          if (response.data) {
            vm.verified = true;
          } else {
            vm.verified = false;
          }
        });
      }
    }
  }
})();