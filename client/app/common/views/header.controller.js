(function () {
  'use strict';
  angular.module('app').controller('HeaderCtrl', HeaderCtrl);

  function HeaderCtrl(identityService, authService) {
    var vm = this;
    vm.indentity = identityService;
    vm.logout = logout;

    function logout() {
      authService.logout();
    }
  }
})();