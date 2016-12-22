(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmSidebar', wpmSidebar);

  function wpmSidebar() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'sidebarCtrl',
      restrict: 'A',
      templateUrl: '/common/components/sidebar.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc(identityService, authService, sidebarService) {
    var vm = this;
    vm.indentity = identityService;
    vm.logout = logout;
    vm.sidebarStatus = sidebarService.getSidebarStatus();

    function logout() {
      authService.logout();
    }
  }
})();