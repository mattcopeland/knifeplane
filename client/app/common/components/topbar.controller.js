(function () {
  'use strict';
  angular.module('app').controller('TopbarCtrl', TopbarCtrl);

  function TopbarCtrl(identityService, authService) {
    var vm = this;
    vm.indentity = identityService;
    vm.logout = logout;

    function logout() {
      authService.logout();
    }
  }
})();