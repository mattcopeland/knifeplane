(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpHeader', kpHeader);

  function kpHeader() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'headerCtrl',
      restrict: 'A',
      templateUrl: '/common/components/header.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc(sidebarService, identityService, authService) {
    var vm = this;
    vm.indentity = identityService;
    vm.logout = logout;
    vm.sidebarStatus = sidebarService.getSidebarStatus();
    vm.toggleSidebar = toggleSidebar;

    function toggleSidebar() {
      vm.sidebarStatus.left = !vm.sidebarStatus.left;
      sidebarService.setSidebarStatus(vm.sidebarStatus.left);
    }

    function logout() {
      authService.logout();
    }
  }
})();