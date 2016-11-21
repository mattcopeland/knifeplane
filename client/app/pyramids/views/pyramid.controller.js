(function () {
  'use strict';
  angular.module('app').controller('PyramidCtrl', PyramidCtrl);

  function PyramidCtrl($state, $stateParams, pyramidsService) {
    var vm = this;
    vm.competitionId = null;
    vm.pyramid = null;

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;

        pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
          if (pyramid.data) {
            vm.pyramid = pyramid.data;
          } else {
            $state.go('pyramids.myPyramids');
          }
        });
      }
    }
  }
})();