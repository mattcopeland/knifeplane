(function () {
  'use strict';
  angular.module('app').controller('AppCtrl', AppCtrl);

  function AppCtrl($state, localStorageService) {
    var appCtrl = this;
    // Use this for Sidebar menu
    appCtrl.$state = $state;
    // Lock the sidebar in view
    appCtrl.lockSidebar = localStorageService.get('sidebarLocked');
    appCtrl.toggleSidebarLocked = toggleSidebarLocked;

    function toggleSidebarLocked(locked) {
      localStorageService.set('sidebarLocked', locked);
    }
  }
})();