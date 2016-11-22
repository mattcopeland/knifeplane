(function () {
  'use strict';
  angular.module('app').controller('AppCtrl', AppCtrl);

  function AppCtrl($state) {
    var appCtrl = this;
    // Use this for Sidebar menu
    appCtrl.$state = $state;

    // Lock the sidebar in view
    appCtrl.lockSidebar = false;
  }
})();