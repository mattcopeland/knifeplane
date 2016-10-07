(function () {
  'use strict';
  angular.module('app').controller('AppCtrl', AppCtrl);

  function AppCtrl($state) {
    var appCtrl = this;
    appCtrl.toggleSidebar = toggleSidebar;
    appCtrl.$state = $state;
    // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
    appCtrl.sidebarToggle = {
      left: false,
      right: false
    };

    function toggleSidebar() {
      appCtrl.sidebarToggle.left = !appCtrl.sidebarToggle.left;
    }
  }
})();