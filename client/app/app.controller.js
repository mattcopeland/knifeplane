(function () {
  'use strict';
  angular.module('app').controller('AppCtrl', AppCtrl);

  function AppCtrl($state) {
    var appCtrl = this;
    appCtrl.$state = $state;
  }
})();