(function () {
  'use strict';
  angular.module('app').controller('HomeCtrl', HomeCtrl);

  function HomeCtrl(pyramidsService) {
    var vm = this;
    vm.pyramids = [];

    activate();

    function activate() {
      pyramidsService.getPyramids().then(function (pyramids) {
        vm.pyramids = pyramids.data;
      });
    }
  }
})();