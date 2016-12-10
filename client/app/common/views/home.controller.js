(function () {
  'use strict';
  angular.module('app').controller('HomeCtrl', HomeCtrl);

  function HomeCtrl(pyramidsService, identityService) {
    var vm = this;
    vm.pyramids = [];

    activate();

    function activate() {
      pyramidsService.getPyramids(identityService.currentUser._id).then(function (pyramids) {
        vm.pyramids = pyramids.data;
      });
    }
  }
})();