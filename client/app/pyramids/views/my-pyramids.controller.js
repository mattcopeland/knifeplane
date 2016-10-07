(function () {
  'use strict';
  angular.module('app').controller('MyPyramidsCtrl', MyPyramidsCtrl);

  function MyPyramidsCtrl($state, pyramidsService, identityService) {
    var vm = this;
    vm.pyramids = null;

    activate();

    function activate() {
      pyramidsService.getPyramidsForUser(identityService.currentUser._id).then(function (pyramids) {
        vm.pyramids = pyramids.data;
      });
    }
  }
})();