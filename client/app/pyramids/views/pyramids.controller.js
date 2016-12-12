(function () {
  'use strict';
  angular.module('app').controller('PyramidsCtrl', PyramidsCtrl);

  function PyramidsCtrl(pyramidsService) {
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