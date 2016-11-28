(function () {
  'use strict';
  angular.module('app').controller('AdminCtrl', AdminCtrl);

  function AdminCtrl($state, $stateParams, pyramidsService, identityService) {
    var vm = this;
    vm.competitionId = null;
    vm.pyramid = null;

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;
        pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
          // Check to see if this user is an owner of this competition
          if (pyramid.data && _.some(pyramid.data.owners, ['_id', identityService.currentUser._id])) {
            vm.pyramid = pyramid.data;
          } else {
            $state.go('pyramids.myPyramids');
          }
        });
      } else {
        $state.go('pyramids.myPyramids');
      }
    }
  }
})();